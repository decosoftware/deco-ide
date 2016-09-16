//
//  DecoSDK.h
//  DecoSDK
//
//  Created by Gavin Owens on 8/22/16.
//  Copyright © 2016 Deco Software Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#import "ScreenStream.h"

@interface DecoSDK : RCTEventEmitter <RCTBridgeModule>

@property (nonatomic) BOOL isStreaming;

@end
