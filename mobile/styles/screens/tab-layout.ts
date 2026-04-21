import { StyleSheet } from 'react-native'

export const tabLayoutStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  dock: {
    height: 52,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16
  },
  item: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemActive: {
    backgroundColor: '#185f37'
  },
  itemPressed: {
    opacity: 0.82
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
