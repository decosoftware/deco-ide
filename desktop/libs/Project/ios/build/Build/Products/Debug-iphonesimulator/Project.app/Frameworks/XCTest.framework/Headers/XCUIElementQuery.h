//
//  Copyright (c) 2015 Apple Inc. All rights reserved.
//

#import <XCTest/XCTestDefines.h>

#if XCT_UI_TESTING_AVAILABLE

#import <XCTest/XCUIElementTypes.h>
#import <XCTest/XCUIElementTypeQueryProvider.h>

NS_ASSUME_NONNULL_BEGIN

XCT_EXPORT NSString *XCUIIdentifierCloseWindow;
XCT_EXPORT NSString *XCUIIdentifierMinimizeWindow;
XCT_EXPORT NSString *XCUIIdentifierZoomWindow;
XCT_EXPORT NSString *XCUIIdentifierFullScreenWindow;

@class XCUIElement;

/*! Object for locating elements that can be chained with other queries. */
NS_CLASS_AVAILABLE(10_11, 9_0)
@interface XCUIElementQuery : NSObject <XCUIElementTypeQueryProvider>

/*! Returns an element that will use the query for resolution. */
@property (readonly) XCUIElement *element;

/*! Evaluates the query at the time it is called and returns the number of matches found. */
@property (readonly) NSUInteger count;

/*! Returns an element that will resolve to the index into the query's result set. */
- (XCUIElement *)elementAtIndex:(NSUInteger)index NS_DEPRECATED(10_11, 10_11, 9_0, 9_0, "Use elementBoundByIndex instead.");

/*! Returns an element that will use the index into the query's results to determine which underlying accessibility element it is matched with. */
- (XCUIElement *)elementBoundByIndex:(NSUInteger)index;

/*! Returns an element that matches the predicate. The predicate will be evaluated against objects of type id<XCUIElementAttributes>. */
- (XCUIElement *)elementMatchingPredicate:(NSPredicate *)predicate;

/*! Returns an element that matches the type and identifier. */
- (XCUIElement *)elementMatchingType:(XCUIElementType)elementType identifier:(nullable NSString *)identifier;

/*! Keyed subscripting is implemented as a shortcut for matching an identifier only. For example, app.descendants["Foo"] -> XCUIElement. */
- (XCUIElement *)objectForKeyedSubscript:(NSString *)key;

/*! Immediately evaluates the query and returns an array of elements bound to the resulting accessibility elements. */
@property (readonly, copy) NSArray<XCUIElement *> *allElementsBoundByAccessibilityElement;

/*! Immediately evaluates the query and returns an array of elements bound by the index of each result. */
@property (readonly, copy) NSArray<XCUIElement *> *allElementsBoundByIndex;

/*! Returns a new query that finds the descendants of all the elements found by the receiver. */
- (XCUIElementQuery *)descendantsMatchingType:(XCUIElementType)type;

/*! Returns a new query that finds the direct children of all the elements found by the receiver. */
- (XCUIElementQuery *)childrenMatchingType:(XCUIElementType)type;

/*! Returns a new query that applies the specified attributes or predicate to the receiver. The predicate will be evaluated against objects of type id<XCUIElementAttributes>. */
- (XCUIElementQuery *)matchingPredicate:(NSPredicate *)predicate;
- (XCUIElementQuery *)matchingType:(XCUIElementType)elementType identifier:(nullable NSString *)identifier;
- (XCUIElementQuery *)matchingIdentifier:(NSString *)identifier;

/*! Returns a new query for finding elements that contain a descendant matching the specification. The predicate will be evaluated against objects of type id<XCUIElementAttributes>. */
- (XCUIElementQuery *)containingPredicate:(NSPredicate *)predicate;
- (XCUIElementQuery *)containingType:(XCUIElementType)elementType identifier:(nullable NSString *)identifier;

/*!
 @discussion
 Provides debugging information about the query. The data in the string will vary based on the time
 at which it is captured, but it may include any of the following as well as additional data:
    • A description of each step of the query.
    • Information about the inputs and matched outputs of each step of the query.
 This data should be used for debugging only - depending on any of the data as part of a test is unsupported.
 */
@property (readonly, copy) NSString *debugDescription;

@end

NS_ASSUME_NONNULL_END

#endif
