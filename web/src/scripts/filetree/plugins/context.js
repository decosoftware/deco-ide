export default {
  onContextMenu: function (pluginOptions, e, node, nodeMetadata, index) {
    const {controller} = this.props
    const onContext = this.props.onContext || () => {}
    onContext.call(this, e, node, nodeMetadata, index)
  },
}
