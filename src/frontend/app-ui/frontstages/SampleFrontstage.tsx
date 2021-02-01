/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ViewState } from "@bentley/imodeljs-frontend";
import {
  BasicNavigationWidget,
  ContentGroup,
  ContentLayoutDef,
  CoreTools,
  CustomItemDef,
  Frontstage,
  FrontstageProvider,
  IModelConnectedViewSelector,
  IModelViewportControl,
  ReviewToolWidget,
  ToolbarHelper,
  UiFramework,
  Widget,
  Zone,
} from "@bentley/ui-framework";
import * as React from "react";


/* eslint-disable react/jsx-key */

/**
 * Sample Frontstage for 9-Zone sample application
 */
export class SampleFrontstage extends FrontstageProvider {
  // Content layout for content views
  private _contentLayoutDef: ContentLayoutDef;

  // Content group for both layouts
  private _contentGroup: ContentGroup;

  constructor(public viewStates: ViewState[]) {
    super();

    // Create the content layouts.
    this._contentLayoutDef = new ContentLayoutDef({
    });

    // Create the content group.
    this._contentGroup = new ContentGroup({
      contents: [
        {
          classId: IModelViewportControl,
          applicationData: {
            viewState: this.viewStates[0],
            iModelConnection: UiFramework.getIModelConnection(),
          },
        },
      ],
    });
  }

  /** Define the Frontstage properties */
  public get frontstage() {
    return (
      <Frontstage
        id="SampleFrontstage"
        defaultTool={CoreTools.selectElementCommand}
        toolSettings={<Zone widgets={[<Widget isToolSettings={true} />]} />}
        defaultLayout={this._contentLayoutDef}
        contentGroup={this._contentGroup}
        isInFooterMode={true}
        topLeft={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={<SampleToolWidget />} />,
            ]}
          />
        }
        topCenter={<Zone widgets={[<Widget isToolSettings={true} />]} />}
        topRight={
          <Zone
            widgets={[
              /** Use standard NavigationWidget delivered in ui-framework */
              <Widget
                isFreeform={true}
                element={
                  <BasicNavigationWidget
                    additionalVerticalItems={ToolbarHelper.createToolbarItemsFromItemDefs(
                      [this._viewSelectorItemDef],
                      30
                    )}
                  />
                }
              />,
            ]}
          />
        }
      />
    );
  }


  /** Get the CustomItemDef for ViewSelector  */
  private get _viewSelectorItemDef() {
    return new CustomItemDef({
      customId: "sampleApp:viewSelector",
      reactElement: (
        <IModelConnectedViewSelector
          listenForShowUpdates={false} // Demo for showing only the same type of view in ViewSelector - See IModelViewport.tsx, onActivated
        />
      ),
    });
  }
}

/**
 * Define a ToolWidget with Buttons to display in the TopLeft zone.
 */
class SampleToolWidget extends React.Component {
  public render(): React.ReactNode {
    return <ReviewToolWidget />;
  }
}