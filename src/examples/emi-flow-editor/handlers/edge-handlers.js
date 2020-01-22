import { intentsByQuestionStr } from '../empathy';

const getEdgeHandlers = bwdlEditable => {
  bwdlEditable.setSelectedConnIndex = function(connIndex) {
    this.selectedConnIndex = connIndex;
  }.bind(bwdlEditable);

  bwdlEditable.getSelectedConnIndex = function() {
    return this.selectedConnIndex || 0;
  }.bind(bwdlEditable);

  bwdlEditable._changeSelectedConn = function(f) {
    const index = this.state.selected.sourceNode.gnode.question.index;
    const targetIndex = this.state.selected.targetNode.gnode.question.index;

    this.setState(prevState => {
      const newBwdlJson = {
        ...prevState.bwdlJson,
      };
      const conns = newBwdlJson[index].question.connections;

      f(
        conns[this.getSelectedConnIndex()],
        conns,
        newBwdlJson,
        index,
        targetIndex
      );

      return this.updateNodesFromBwdl({
        bwdlJson: newBwdlJson,
        bwdlText: this.stringify(newBwdlJson),
      });
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeConn = function(connProperty, newValue) {
    this._changeSelectedConn(conn => (conn[connProperty] = newValue));
  }.bind(bwdlEditable);

  bwdlEditable.onMakeDefaultConn = function(enabling) {
    this._changeSelectedConn((conn, conns) => {
      if (enabling) {
        const defaultConn = conns.find(conn => conn.isDefault);

        if (defaultConn) {
          defaultConn.isDefault = false;
        }
      }

      conn['isDefault'] = enabling;
    });
  }.bind(bwdlEditable);

  bwdlEditable.getPrevIndexes = function() {
    return this.getAncestorIndexes(this.state.selected.source);
  }.bind(bwdlEditable);

  bwdlEditable.getIntents = function() {
    const ai = this.state.selected.sourceNode.gnode.ai;

    return intentsByQuestionStr[ai.question_str] || [];
  }.bind(bwdlEditable);

  bwdlEditable.getPrevContextVars = function() {
    const vars = new Set();

    this.getAncestorIndexes(this.state.selected.source, edge => {
      Object.keys(edge.conns[0].setContext).forEach(vars.add, vars);
    });

    return Array.from(vars);
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getEdgeHandlers;
