<Navigator.NavigationBar 
  style={{flex: 1, height: 44, backgroundColor: 'white', alignItems: 'center'}}
  routeMapper={{
    RightButton: (route, navigator, index, navState) => {
      return (
        <TouchableOpacity onPress={() => {}}>
          <Text style={{color: '#0076FF', marginRight: 10}}>{'Next'}</Text>
        </TouchableOpacity>
      )
    },
    LeftButton: (route, navigator, index, navState) => {
      return (
        <TouchableOpacity onPress={() => {}}>
          <Text style={{color: '#0076FF', marginLeft: 10}}>{'Previous'}</Text>
        </TouchableOpacity>
      )
    },
    Title: (route, navigator, index, navState) => {
      return <Text>{route.title}</Text>
    },
  }} />
###
({
  dependencies: {
    'react-native': [
      'Navigator',
      'View',
      'Text',
      'TouchableOpacity',
    ]
  },
  require: [
    "import { Navigator, View, Text, TouchableOpacity } from 'react-native'",
  ],
})