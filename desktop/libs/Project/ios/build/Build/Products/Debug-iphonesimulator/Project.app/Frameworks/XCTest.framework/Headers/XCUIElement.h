//
//  Copyright (c) 2014-2015 Apple Inc. All rights reserved.
//

#import <XCTest/XCTestDefines.h>

#if TARGET_OS_IPHONE
#import <UIKit/UIKit.h>
#else
#import <AppKit/AppKit.h>
#endif

#import <XCTest/XCUIElementAttributes.h>
#import <XCTest/XCUIElementTypeQueryProvider.h>

NS_ASSUME_NONNULL_BEGIN

#if XCT_UI_TESTING_AVAILABLE

NS_ENUM_AVAILABLE(10_11, 9_0)
typedef NS_OPTIONS(NSUInteger, XCUIKeyModifierFlags) {
    XCUIKeyModifierNone       = 0,
    XCUIKeyModifierAlphaShift = (1UL << 0),
    XCUIKeyModifierShift      = (1UL << 1),
    XCUIKeyModifierControl    = (1UL << 2),
    XCUIKeyModifierAlternate  = (1UL << 3),
    XCUIKeyModifierOption     = XCUIKeyModifierAlternate,
    XCUIKeyModifierCommand    = (1UL << 4),
};

@class XCUIElementQuery;
@class XCUICoordinate;

/*!
 * @class XCUIElement (/seealso XCUIElementAttributes)
 * Elements are objects encapsulating the information needed to dynamically locate a user interface
 * element in an application. Elements are described in terms of queries /seealso XCUIElementQuery.
 */
NS_CLASS_AVAILABLE(10_11, 9_0)
@interface XCUIElement : NSObject <XCUIElementAttributes, XCUIElementTypeQueryProvider>

/*! Test to determine if the element exists. */
@property (readonly) BOOL exists;

/*! Whether or not a hit point can be computed for the element for the purpose of synthesizing events. */
@property (readonly, getter = isHittable) BOOL hittable;

/*! Returns a query for all descendants of the element matching the specified type. */
- (XCUIElementQuery *)descendantsMatchingType:(XCUIElementType)type;

/*! Returns a query for direct children of the element matching the specified type. */
- (XCUIElementQuery *)childrenMatchingType:(XCUIElementType)type;

#if !TARGET_OS_TV
/*! Creates and returns a new coordinate that will compute its screen point by adding the offset multiplied by the size of the element’s frame to the origin of the element’s frame. */
- (XCUICoordinate *)coordinateWithNormalizedOffset:(CGVector)normalizedOffset;
#endif

/*!
 @discussion
 Provides debugging information about the element. The data in the string will vary based on the
 time at which it is captured, but it may include any of the following as well as additional data:
    • Values for the elements attributes.
    • The entire tree of descendants rooted at the element.
    • The element's query.
 This data should be used for debugging only - depending on any of the data as part of a test is unsupported.
 */
@property (readonly, copy) NSString *debugDescription;

@end

#pragma mark - Event Synthesis

/*!
 * @category Events
 * Events that can be synthesized relative to an XCUIElement object. When an event API is called, the element
 * will be resolved. If zero or multiple matches are found, an error will be raised.
 */
@interface XCUIElement (XCUIElementEventSynthesis)

/*!
 * Types a string into the element. The element or a descendant must have keyboard focus; otherwise an
 * error is raised.
 *
 * This API discards any modifiers set in the current context by +performWithKeyModifiers:block: so that
 * it strictly interprets the provided text. To input keys with modifier flags, use  -typeKey:modifierFlags:.
 */
- (void)typeText:(NSString *)text;

#if TARGET_OS_TV
#elif TARGET_OS_IOS

/*!
 * Sends a tap event to a hittable point computed for the element.
 */
- (void)tap;

/*!
 * Sends a double tap event to a hittable point computed for the element.
 */
- (void)doubleTap;

/*!
 * Sends a two finger tap event to a hittable point computed for the element.
 */
- (void)twoFingerTap;

/*!
 * Sends one or more taps with one of more touch points.
 *
 * @param numberOfTaps
 * The number of taps.
 *
 * @param numberOfTouches
 * The number of touch points.
 */
- (void)tapWithNumberOfTaps:(NSUInteger)numberOfTaps numberOfTouches:(NSUInteger)numberOfTouches;

/*!
 * Sends a long press gesture to a hittable point computed for the element, holding for the specified duration.
 *
 * @param duration
 * Duration in seconds.
 */
- (void)pressForDuration:(NSTimeInterval)duration;

/*!
 * Initiates a press-and-hold gesture that then drags to another element, suitable for table cell reordering and similar operations.
 * @param duration
 * Duration of the initial press-and-hold.
 * @param otherElement
 * The element to finish the drag gesture over. In the example of table cell reordering, this would be the reorder element of the destination row.
 */
- (void)pressForDuration:(NSTimeInterval)duration thenDragToElement:(XCUIElement *)otherElement;

/*!
 * Sends a swipe-up gesture.
 */
- (void)swipeUp;

/*!
 * Sends a swipe-down gesture.
 */
- (void)swipeDown;

/*!
 * Sends a swipe-left gesture.
 */
- (void)swipeLeft;

/*!
 * Sends a swipe-right gesture.
 */
- (void)swipeRight;

/*!
 * Sends a pinching gesture with two touches.
 *
 * The system makes a best effort to synthesize the requested scale and velocity: absolute accuracy is not guaranteed.
 * Some values may not be possible based on the size of the element's frame - these will result in test failures.
 *
 * @param scale
 * The scale of the pinch gesture.  Use a scale between 0 and 1 to "pinch close" or zoom out and a scale greater than 1 to "pinch open" or zoom in.
 *
 * @param velocity
 * The velocity of the pinch in scale factor per second.
 */
- (void)pinchWithScale:(CGFloat)scale velocity:(CGFloat)velocity;

/*!
 * Sends a rotation gesture with two touches.
 *
 * The system makes a best effort to synthesize the requested rotation and velocity: absolute accuracy is not guaranteed.
 * Some values may not be possible based on the size of the element's frame - these will result in test failures.
 *
 * @param rotation
 * The rotation of the gesture in radians.
 *
 * @param velocity
 * The velocity of the rotation gesture in radians per second.
 */
- (void)rotate:(CGFloat)rotation withVelocity:(CGFloat)velocity;

#elif TARGET_OS_MAC

/*!
 * Moves the cursor over the element.
 */
- (void)hover;

/*!
 * Sends a click event to a hittable point computed for the element.
 */
- (void)click;

/*!
 * Sends a double click event to a hittable point computed for the element.
 */
- (void)doubleClick;

/*!
 * Sends a right click event to a hittable point computed for the element.
 */
- (void)rightClick;

/*!
 * Clicks and holds for a specified duration (generally long enough to start a drag operation) then drags
 * to the other element.
 */
- (void)clickForDuration:(NSTimeInterval)duration thenDragToElement:(XCUIElement *)otherElement;

/*!
 * Hold modifier keys while the given block runs. This method pushes and pops the modifiers as global state
 * without need for reference to a particular element. Inside the block, elements can be clicked on, dragged
 * from, typed into, etc.
 */
+ (void)performWithKeyModifiers:(XCUIKeyModifierFlags)flags block:(void (^)(void))block;

/*!
 * Types a single key with the specified modifier flags. Although `key` is a string, it must represent
 * a single key on a physical keyboard; strings that resolve to multiple keys will raise an error at runtime.
 * In addition to literal string key representations like "a", "6", and "[", keys such as the arrow keys,
 * command, control, option, and function keys can be typed using constants defined for them in XCUIKeyboardKeys.h
 */
- (void)typeKey:(NSString *)key modifierFlags:(XCUIKeyModifierFlags)flags;

/*!
 * Scroll the view the specified pixels, x and y.
 */
- (void)scrollByDeltaX:(CGFloat)deltaX deltaY:(CGFloat)deltaY;

#endif

@end

/*! This category on XCUIElement provides functionality for automating UISlider and NSSlider. */
@interface XCUIElement (XCUIElementTypeSlider)

/*! Manipulates the UI to change the displayed value of the slider to one based on a normalized position. 0 corresponds to the minimum value of the slider, 1 corresponds to its maximum value. The adjustment is a "best effort" to move the indicator to the desired position; absolute fidelity is not guaranteed. */
- (void)adjustToNormalizedSliderPosition:(CGFloat)normalizedSliderPosition;

/*! Returns the position of the slider's indicator as a normalized value where 0 corresponds to the minimum value of the slider and 1 corresponds to its maximum value. */
@property (readonly) CGFloat normalizedSliderPosition;

@end

#if TARGET_OS_IOS

/*! This category on XCUIElement provides functionality for automating the picker wheels of UIPickerViews and UIDatePickers. */
@interface XCUIElement (XCUIElementTypePickerWheel)

/*! Changes the displayed value for the picker wheel. Will generate a test failure if the specified value is not available. */
- (void)adjustToPickerWheelValue:(NSString *)pickerWheelValue;

@end

#endif

#endif

NS_ASSUME_NONNULL_END
