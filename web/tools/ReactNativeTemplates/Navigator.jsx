<Navigator 
  style={{width: 300, height: 300,}}
  initialRoute={{
    title: 'Home',
    routeProps: {
      style: {
        flex: 1, 
        alignItems: 'center', 
        paddingTop: 100, 
        backgroundColor: "rgba(74,144,226,1)",
      }
    },
  }}
  navigationBar={null}
  renderScene={(route, navigator) => {
    return (
      <View style={route.routeProps && route.routeProps.style}>
        <Text>My Scene</Text>
      </View>
    )
  }} />
###
({
  dependencies: {
    'react-native': [
      'Navigator',
      'View',
      'Text',
    ]
  },
  require: [
    "import { Navigator, View, Text } from 'react-native'",
  ],
})