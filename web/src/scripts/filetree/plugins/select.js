import { treeUtils } from 'file-tree-common'

const { getVisibleNodesByIndex, countVisibleNodes } = treeUtils

const selectNode = function(e, node, nodeMetadata, index) {
  const onSelect = this.props.onSelect || () => {}
  onSelect.call(this, e, node, nodeMetadata, index)
}

const getSelectionInfo = (tree, metadata) => {
  const nodeInfo = getVisibleNodesByIndex(tree, metadata, 0, Infinity)

  let selectedIndex = 0
  while (selectedIndex < nodeInfo.length) {
    const {path} = nodeInfo[selectedIndex].node
    if (metadata[path] && metadata[path].selected) {
      break
    }
    selectedIndex++
  }

  return {
    nodes: nodeInfo.map(({node}) => node),
    selectedIndex,
  }
}

export default {
  onClick: function (pluginOptions, e, node, nodeMetadata, index) {
    const { controller } = this.props
    const onSelect = this.props.onSelect || () => {}
    const {type, path} = node
    const {selected} = nodeMetadata
    const {tree, metadata} = this.state

    if (e.metaKey && pluginOptions.multiple !== false) {
      controller.updateNodeMetadata(path, 'selected', ! selected)

      if (! selected ) {
        onSelect.call(this, e, node, nodeMetadata, index)
      }
    } else if (e.shiftKey && pluginOptions.multiple !== false) {
      const {nodes, selectedIndex} = getSelectionInfo(tree, metadata)
      const range = selectedIndex > index ? [index, selectedIndex] : [selectedIndex, index]

      for (let i = range[0]; i <= range[1]; i++) {
        const currentNode = nodes[i]
        const currentMetadata = metadata[currentNode.path] || {}
        const currentSelected = currentMetadata.selected

        controller.updateNodeMetadata(currentNode.path, 'selected', true)

        if (! currentSelected) {
          onSelect.call(this, e, currentNode, currentMetadata, i)
        }
      }
    } else {
      selectNode.call(this, e, node, nodeMetadata, index)
    }
  },
  onDoubleClick: function (pluginOptions, e, node, nodeMetadata, index) {
    const {selected} = nodeMetadata
    const onDoubleSelect = this.props.onDoubleSelect || () => {}
    if (selected) {
      onDoubleSelect.call(this, e, node, nodeMetadata, index)
    }
  },
  onKeyDown: function (pluginOptions, e) {
    const {controller} = this.props
    const {tree, metadata} = this.state

    switch (e.which) {
      // up
      case 38: {
        const {nodes, selectedIndex} = getSelectionInfo(tree, metadata)
        if (selectedIndex > 0) {
          e.preventDefault()
          const nextNode = nodes[selectedIndex - 1]
          selectNode.call(this, e, nextNode, metadata[nextNode.path] || {}, selectedIndex - 1)
        }
        break
      }
      // down
      case 40: {
        const {nodes, selectedIndex} = getSelectionInfo(tree, metadata)
        if (selectedIndex < nodes.length - 1) {
          e.preventDefault()
          const nextNode = nodes[selectedIndex + 1]
          selectNode.call(this, e, nextNode, metadata[nextNode.path] || {}, selectedIndex + 1)
        }
        break
      }
    }
  },
}
