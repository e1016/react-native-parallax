import isEqual from 'lodash/isEqual'
import React, { Component } from 'react'
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from 'react-native'

var WINDOW_HEIGHT = Dimensions.get('window').height;

class ParallaxImage extends Component {
  constructor (props) {
    super(props)
    this.isLayoutStale = true
    this.state = {
      offset: 0,
      height: 0,
      width:  0
    }
  }

  setNativeProps (nativeProps) {
    this._container.setNativeProps(nativeProps)
  }

  // Measure again since onLayout event won't pass the offset
  handleLayout (event) {
    if (this.isLayoutStale) {
      var comp = this.thble || this._container
      comp.measure(this.handleMeasure.bind(this))
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!isEqual(nextProps, this.props)) {
      this.isLayoutStale = true
    }
  }

  handleMeasure (ox, oy, width, height, px, py) {
    this.isLayoutStale = false
    this.setState({
      offset: py,
      height,
      width
    })
  }

  render () {
    var { offset, width, height } = this.state
    var {
      onPress,
      scrollY,
      parallaxFactor,
      style,
      imageStyle,
      overlayStyle,
      children,
      touchableStyles,
      ...props
    } = this.props

    parallaxFactor = parallaxFactor || 0.2
    var parallaxPadding = height * parallaxFactor

    height = height + parallaxPadding * 2
    var parallaxStyle = { height, width }

    if (scrollY) {
      parallaxStyle.transform = [
        {
          translateY:   scrollY.interpolate({
            inputRange:   [offset - height, offset + WINDOW_HEIGHT + height],
            outputRange:  [-parallaxPadding, parallaxPadding],
            extrapolate:  'clamp'
          })
        }
      ]
    } else {
      parallaxStyle.transform = [
        { translateY: -parallaxPadding }
      ]
    }

    var content = (
      <View
        ref={ component => this._container = component }
        style={[ style, styles.container ]}
        onLayout={ this.handleLayout.bind(this) }>
        <Animated.Image
          { ...props }
          style={[ imageStyle, parallaxStyle ]}
          pointerEvents="none"
        />
      </View>
    )
    // Since we can't allow nested Parallax.Images, we supply this shorthand to wrap a touchable
    // around the element
    if (onPress) {
      return (
        <TouchableOpacity
          activeOpacity={ 0.8 }
          style={ touchableStyles }
          ref={ component => { this.thble = component }}
          onPress={ onPress }>
          { content }
          { children }
        </TouchableOpacity>
      )
    }
    return content
  }
}

var styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    // position: 'relative'
  },
  overlay: {
    flex: 1,
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0
  }
})

export default ParallaxImage
