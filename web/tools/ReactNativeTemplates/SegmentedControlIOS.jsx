<SegmentedControlIOS 
  values={['A', 'B', 'C']}
  momentary={true}
  tintColor={'black'}
  style={{
    width: 100,
  }}
  selectedIndex={(this.state && this.state.scIndex) || 0}
  onValueChange={(value) => {}}
  onChange={(event) => {
    this.setState({ 
      scIndex: event.nativeEvent.selectedSegmentIndex 
    })
  }} />