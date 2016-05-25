<Switch
  value={(this.state && this.state.switchValue) || false}
  onValueChange={(value) => {
    this.setState({switchValue: value})
  }}
  // Color props are iOS-only
  // thumbTintColor={'white'} // Removes shadow
  tintColor={"rgba(230,230,230,1)"}
  onTintColor={"rgba(68,219,94,1)"} />