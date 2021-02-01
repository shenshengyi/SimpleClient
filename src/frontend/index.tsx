/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as React from "react";
import * as ReactDOM from "react-dom";
import { NineZoneSampleApp } from "./app/NineZoneSampleApp";
import { AppUi } from "./app-ui/AppUi";
import { AppComposer } from "./components/App";
import "./index.scss";
import { Provider } from "react-redux";
import { Config, OpenMode } from "@bentley/bentleyjs-core";
import { RemoteBriefcaseConnection } from "@bentley/imodeljs-frontend";
import { UiFramework } from "@bentley/ui-framework";

(async () => {
  // Start the app.
  await NineZoneSampleApp.startup();

  // Initialize the AppUi & ConfigurableUiManager
  AppUi.initialize();
  await CreateIModelConnection();
  // when initialization is complete, render
  ReactDOM.render(
    <Provider store={NineZoneSampleApp.store}>
      <AppComposer />
    </Provider>,
    document.getElementById("root") as HTMLElement
  );
})();

async function CreateIModelConnection() {
  const contextId1 = Config.App.get("imjs_contextId_1");
  const imodelId1 = Config.App.get("imjs_imodelId_1");
  const imodel = await RemoteBriefcaseConnection.open(
    contextId1,
    imodelId1,
    OpenMode.Readonly
  );
  UiFramework.setIModelConnection(imodel, true);
}
