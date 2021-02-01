/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ClientRequestContext, Config, Guid } from "@bentley/bentleyjs-core";
import { IModelBankClient } from "@bentley/imodelhub-client";
import { IModelBankBasicAuthorizationClient } from "@bentley/imodelhub-client/lib/imodelbank/IModelBankBasicAuthorizationClient";
import {
  BentleyCloudRpcManager,
  IModelReadRpcInterface,
  IModelTileRpcInterface,
  RpcInterfaceDefinition,
  SnapshotIModelRpcInterface,
} from "@bentley/imodeljs-common";
import { IModelApp, IModelAppOptions } from "@bentley/imodeljs-frontend";
import { PresentationRpcInterface } from "@bentley/presentation-common";
import { Presentation } from "@bentley/presentation-frontend";
import { AppNotificationManager, FrameworkReducer, FrameworkState, UiFramework } from "@bentley/ui-framework";
import { combineReducers, createStore, Store } from "redux";

// React-redux interface stuff
export interface RootState {
  frameworkState?: FrameworkState;
}

export type AppStore = Store<RootState>;

/**
 * Centralized state management class using  Redux actions, reducers and store.
 */
export class AppState {
  private _store: AppStore;
  private _rootReducer: any;

  constructor() {
    // this is the rootReducer for the sample application.
    this._rootReducer = combineReducers<RootState>({
      frameworkState: FrameworkReducer,
    } as any);

    // create the Redux Store.
    this._store = createStore(
      this._rootReducer,
      (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
        (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    );
  }

  public get store(): Store<RootState> {
    return this._store;
  }
}

// subclass of IModelApp needed to use imodeljs-frontend
export class NineZoneSampleApp {
  private static _appState: AppState;

  public static get store(): AppStore {
    return this._appState.store;
  }

  public static async startup(): Promise<void> {
    const opts: IModelAppOptions = {};
    opts.notifications = new AppNotificationManager();
    opts.applicationVersion = "1.0.0";
    const url = Config.App.get("imjs_imodelbank_url");
    const imodelClient = new IModelBankClient(url, undefined);
    opts.imodelClient = imodelClient;
    // iTwinStack: Setup IModelBankBasicAuthorizationClient from username and password in config
    const email = Config.App.get("imjs_imodelbank_user");
    const password = Config.App.get("imjs_imodelbank_password");
    opts.authorizationClient = new IModelBankBasicAuthorizationClient(
      { id: Guid.createValue() },
      { email, password }
    );

    await IModelApp.startup(opts);
    await IModelApp.authorizationClient?.signIn(new ClientRequestContext());
    // contains various initialization promises which need
    // to be fulfilled before the app is ready
    const initPromises = new Array<Promise<any>>();

    // initialize RPC communication
    initPromises.push(NineZoneSampleApp.initializeRpc());

    // initialize localization for the app
    initPromises.push(
      IModelApp.i18n.registerNamespace("NineZoneSample").readFinished
    );

    // create the application state store for Redux
    this._appState = new AppState();

    // initialize UiFramework
    initPromises.push(UiFramework.initialize(this.store, IModelApp.i18n));
    initPromises.push(NineZoneSampleApp.registerTool());
    // initialize Presentation
    initPromises.push(
      Presentation.initialize({
        activeLocale: IModelApp.i18n.languageList()[0],
      })
    );

    // the app is ready when all initialization promises are fulfilled
    await Promise.all(initPromises);
  }
  private static async registerTool() {
    await IModelApp.i18n.registerNamespace("NineZoneSample").readFinished;
  }
  private static async initializeRpc(): Promise<void> {
    const rpcInterfaces = getSupportedRpcs();
    const backendURL = Config.App.get("imjs_backend_url");
    const rpcParams = {
      info: { title: "ninezone-sample-app", version: "v1.0" },
      uriPrefix: backendURL,
    };
    BentleyCloudRpcManager.initializeClient(rpcParams, rpcInterfaces);
  }
}
export function getSupportedRpcs(): RpcInterfaceDefinition[] {
  return [
    IModelReadRpcInterface,
    IModelTileRpcInterface,
    PresentationRpcInterface,
    SnapshotIModelRpcInterface,
  ];
}
