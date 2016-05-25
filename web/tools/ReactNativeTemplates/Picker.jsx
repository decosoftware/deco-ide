<Picker 
  style={{
    width: 100,
  }}
  selectedValue={(this.state && this.state.pickerValue) || 'a'}
  onValueChange={(value) => {
    this.setState({value})
  }}>
  <Picker.Item label={'Hello'} value={'a'} />
  <Picker.Item label={'World'} value={'b'} />
</Picker>