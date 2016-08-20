import { fileTreeController } from './index'

export default {
  selectFile: (filePath) => {
    const { metadata } = fileTreeController
    // Disable all existing selections
    for (let key in metadata) {
      if (metadata[key] && metadata[key].selected) {
        fileTreeController.updateNodeMetadata(key, 'selected', false)
      }
    }

    fileTreeController.updateNodeMetadata(filePath, 'selected', true)
  },
  clearSelections: () => {
    const { metadata } = fileTreeController
    // Disable all existing selections
    for (let key in metadata) {
      if (metadata[key] && metadata[key].selected) {
        fileTreeController.updateNodeMetadata(key, 'selected', false)
      }
    }
  },
  expandNode: (nodePath) => {
    fileTreeController.updateNodeMetadata(nodePath, 'expanded', true)
    fileTreeController.watchPath(nodePath)
  }
}
