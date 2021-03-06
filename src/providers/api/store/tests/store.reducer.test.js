import StoreReducer from "../store.reducer";
import {
  asyncAdd,
  asyncDel,
  asyncGet,
  asyncList,
  asyncUpdate,
} from "../store.async";

import InitialState from "../store.initial";
import { ReducerTest } from "../../test.fixtures/generate.reducer.tests";
jest.mock("../store.async");

ReducerTest(
  "store",
  StoreReducer,
  InitialState,
  asyncAdd,
  asyncDel,
  asyncGet,
  asyncList,
  asyncUpdate
);
