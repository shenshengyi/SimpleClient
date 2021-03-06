/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  IModelConnection,
  ViewState,
} from "@bentley/imodeljs-frontend";
import {
  BackstageManager,
  CommandItemDef,
  ConfigurableUiManager,
  FrontstageManager,
  SyncUiEventDispatcher,
  UiFramework,
} from "@bentley/ui-framework";
import { SampleFrontstage } from "./frontstages/SampleFrontstage";

/**
 * Example Ui Configuration for an iModel.js App
 */
export class AppUi {
  // Initialize the ConfigurableUiManager
  public static initialize() {
    ConfigurableUiManager.initialize();
  }
  // Command that toggles the backstage
  public static get backstageToggleCommand(): CommandItemDef {
    return BackstageManager.getBackstageToggleCommand();
  }
  /** Handle when an iModel and the views have been selected  */
  public static handleIModelViewsSelected(
    iModelConnection: IModelConnection,
    viewStates: ViewState[]
  ): void {
    // Set the iModelConnection in the Redux store
    UiFramework.setIModelConnection(iModelConnection);
    UiFramework.setDefaultViewState(viewStates[0]);

    // Tell the SyncUiEventDispatcher about the iModelConnection
    SyncUiEventDispatcher.initializeConnectionEvents(iModelConnection);

    // We create a FrontStage that contains the views that we want.
    const frontstageProvider = new SampleFrontstage(viewStates);
    FrontstageManager.addFrontstageProvider(frontstageProvider);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    FrontstageManager.setActiveFrontstageDef(
      frontstageProvider.frontstageDef
    ).then(() => {
      // Frontstage is ready
    });
  }
  /** Pick the first two available spatial, orthographic or drawing view definitions in the imodel */
  public static async getFirstTwoViewDefinitions(
    imodel: IModelConnection
  ): Promise<ViewState[]> {
    const viewSpecs = await imodel.views.queryProps({});
    const acceptedViewClasses = [
      "BisCore:SpatialViewDefinition",
      "BisCore:DrawingViewDefinition",
      "BisCore:OrthographicViewDefinition",
    ];
    const acceptedViewSpecs = viewSpecs.filter(
      (spec) => -1 !== acceptedViewClasses.indexOf(spec.classFullName)
    );
    if (1 > acceptedViewSpecs.length)
      throw new Error("No valid view definitions in imodel");

    const viewStates: ViewState[] = [];
    for (const viewDef of acceptedViewSpecs) {
      const viewState = await imodel.views.load(viewDef.id!);
      viewStates.push(viewState);
    }

    if (1 === acceptedViewSpecs.length) {
      const viewState = await imodel.views.load(acceptedViewSpecs[0].id!);
      viewStates.push(viewState);
    }

    return viewStates;
  }
}
