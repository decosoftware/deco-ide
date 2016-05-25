<DatePickerIOS 
  date={(this.state && this.state.date) || new Date()}
  onDateChange={(newDate) => {
    this.setState({date: newDate})
  }}
  mode={'datetime'}
  timeZoneOffsetInMinutes={-1 * new Date().getTimezoneOffset()} />