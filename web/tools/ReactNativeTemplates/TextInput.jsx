<TextInput
  style={{
    height: 30, 
    width: 100,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.5)",
  }}
  placeholder={'Type here'}
  onChangeText={(text) => {this.setState({text})}}
  value={(this.state && this.state.text) || ''} />