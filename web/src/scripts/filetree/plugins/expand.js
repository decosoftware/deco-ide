export default {
  onClick: function (pluginOptions, e, node, nodeMetadata, index) {
    const {controller, onExpand = () => {}} = this.props
    const {type, path} = node
    const {expanded} = nodeMetadata

    // Only expand directories if no meta or shift key is pressed
    if (type === 'directory' && ! e.metaKey && ! e.shiftKey) {
      const next = ! expanded

      controller.updateNodeMetadata(path, 'expanded', next)

      if (next) {
        controller.watchPath(path)
      }

      onExpand.call(this, e, node, nodeMetadata, index)
    }
  },
}
