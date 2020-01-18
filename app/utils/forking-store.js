import rdflib from 'ember-rdflib';

const { Fetcher, UpdateManager, namedNode, Statement } = rdflib;
const BASE_GRAPH_STRING = "http://mu.semte.ch/libraries/rdf-store";

function additionGraphFor( graph ) {
  const base = `${BASE_GRAPH_STRING}/graphs/add`;
  const graphQueryParam = encodeURIComponent( graph.value );
  return namedNode( `${base}?for=${graphQueryParam}` );
}

function removalGraphFor( graph ) {
  const base = `${BASE_GRAPH_STRING}/graphs/del`;
  const graphQueryParam = encodeURIComponent( graph.value );
  return namedNode( `${base}?for=${graphQueryParam}` );
}

function statementInGraph( quad, graph ) {
  return new Statement( quad.subject, quad.predicate, quad.object, graph );
}

export default class ForkingStore {
  graph = null;
  fetcher = null;
  updater = null;

  constructor(){
    this.graph = rdflib.graph();
    this.fetcher = new Fetcher( this.graph );
    this.updater = new UpdateManager( this.graph );
  }

  /**
   * Load data from an external graph.
   */
  async load(source){
    // TODO: should we remove our changes when a graph is being reloaded?
    await this.fetcher.load( source );
  }

  /**
   * Perform a match on the graph.
   */
  match( subject, predicate, object, graph ) {
    if( graph ) {
      const mainMatch = this.graph.match( subject, predicate, object, graph );
      const addMatch = this.graph.match( subject, predicate, object, additionGraphFor( graph ) );
      const delMatch = this.graph.match( subject, predicate, object, removalGraphFor( graph ) );

      return [ ...mainMatch, ...addMatch ]
        .filter( (quad) => ! delMatch.find( (del) => del.equals( quad ) ) );
    } else {
      // TODO: this code path is normally unused in our cases,
      // implement it for debugging scenarios.

      return this.graph.match( subject, predicate, object );      
    }
  }

  /**
   * Perform any match on the graph.
   */
  any( subject, predicate, object, graph ) {
    const matches = this.match( subject, predicate, object, graph );

    if( matches.length > 0 ) {
      const firstMatch = matches[0];
      if( !subject )
        return firstMatch.subject;
      if( !predicate )
        return firstMatch.predicate;
      if( !object )
        return firstMatch.object;
      if( !graph )
        return firstMatch.graph;
      return true;
    } else {
      return undefined;
    }
  }

  addAll( inserts ) {
    console.log({inserts});
    for( const ins of inserts ) {
      this.graph.add( statementInGraph( ins, additionGraphFor( ins.graph ) ) );
      try {
        this.graph.remove( statementInGraph( ins, removalGraphFor( ins.graph ) ) );
      } catch (e) {
        // this is okay!  the statement may not exist
      }
    }
  }

  removeStatements( deletes ) {
    console.log({deletes});
    for( const del of deletes ) {
      this.graph.add( statementInGraph( del, removalGraphFor( del.graph ) ) );
      try {
        this.graph.remove( statementInGraph( del, additionGraphFor( del.graph ) ) );
      } catch (e) {
        // this is okay!  the statement may not exist
      }
    }
  }

  removeMatches( subject, predicate, object, graph ) {
    const matches = this.graph.match( subject, predicate, object, graph );
    this.graph.removeStatements( matches );
  }

  allGraphs(){
    const graphStatements =
          this
          .graph
          .match()
          .map( ({graph}) => graph.value );

    return new Set( graphStatements );
  }

  changedGraphs(){
    const forGraphs = new Set();
    for( const graph of this.allGraphs() ) {
      let url;
      try {
        url = new URL( graph );
      } catch(e) { /* this may happen */ };

      if( url
          && ( url.href.startsWith( `${BASE_GRAPH_STRING}/graphs/add` )
              || url.href.startsWith( `${BASE_GRAPH_STRING}/graphs/del`) ) ) {
        const target = url.searchParams.get("for");
        if( target ) forGraphs.add( target );
      }
    }

    return [...forGraphs];
  }

  async pushGraphChanges( graph ) {
    const deletes =
          this
          .match( null, null, null, removalGraphFor( graph ) )
          .map( (statement) => statementInGraph( statement, graph ) );

    const inserts =
          this
          .match( null, null, null, additionGraphFor( graph ) )
          .map( (statement) => statementInGraph( statement, graph ) );

    try {
      await this.update( deletes, inserts );
    } finally {
      this.removeMatches( null, null, null, removalGraphFor( graph ) );
      this.removeMatches( null, null, null, additionGraphFor( graph ) );
    }
  }

  async persist() {
    return await Promise.all(
      this
        .changedGraphs()
        .map( (graphString) => namedNode( graphString ) )
        .map( (graph) => this.pushGraphChanges( graph ) )
    );
  }

  /**
   * Promise based version of update protocol
   */
  update( deletes, inserts ) {
    return new Promise( ( resolve, reject ) =>  {
      this.updater.update(
        deletes, inserts,
        resolve, reject );
    } );
  }
}
