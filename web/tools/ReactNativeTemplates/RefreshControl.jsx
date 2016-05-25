<RefreshControl 
  // RefreshControl is meant to be used with ScrollView
  onRefresh={() => {
    // setTimeout is just for this example and is not safe to use in practice
    this.setState({refreshing: true})
    setTimeout(() => { 
      this.setState({refreshing: false}) 
    }, 1000)
  }}
  refreshing={(this.state && this.state.refreshing) || false}
  tintColor={"rgba(74,144,226,1)"}
  title={'Loading...'}
  colors={['#ff0000', '#00ff00', '#0000ff']}
  progressBackgroundColor={"rgba(100,100,100,1)"} />