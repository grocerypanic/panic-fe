import { Paths } from "../../../configuration/backend";
import { match2xx, match400duplicate } from "../../../util/requests/status";
import Request from "../../../util/requests";
import ApiActions from "../api.actions";
import {
  authFailure,
  duplicateObject,
  asyncDispatch,
  calculateListUrl,
} from "../api.async.helpers";

import { generateConverter } from "../api.util.js";
import InitialState from "./transaction.initial";

const convertDatesToLocal = generateConverter(InitialState.class);

export const asyncAdd = async ({ state, action }) => {
  const { dispatch, callback } = action;
  const [response, status] = await Request(
    "POST",
    Paths.manageTransactions,
    action.payload
  );
  // Status Code is 2xx
  if (match2xx(status)) {
    new Promise((resolve) => {
      state.inventory.push(convertDatesToLocal(response));
      dispatch({
        type: ApiActions.SuccessAdd,
        payload: {
          inventory: state.inventory,
        },
        callback,
      });
    });
    return;
  }
  // Duplicate Object Errors
  if (match400duplicate(status, response))
    return duplicateObject(dispatch, callback);
  if (status === 401) return authFailure(dispatch, callback);
  asyncDispatch(dispatch, {
    type: ApiActions.FailureAdd,
    callback,
  });
  return;
};

export const asyncList = async ({ state, action }) => {
  const { dispatch, callback } = action;
  const param = new URLSearchParams({ item: action.payload.id }).toString();

  let url;
  url = calculateListUrl(action, Paths.manageTransactions, param);

  const [response, status] = await Request("GET", url);
  if (match2xx(status)) {
    new Promise((resolve) => {
      const processedResponse = response.results.map((i) =>
        convertDatesToLocal(i)
      );
      dispatch({
        type: ApiActions.SuccessList,
        payload: {
          inventory: processedResponse,
          next: response.next,
          previous: response.previous,
        },
        callback,
      });
    });
    return;
  }
  if (status === 401) return authFailure(dispatch, callback);
  asyncDispatch(dispatch, {
    type: ApiActions.FailureList,
    callback,
  });
  return;
};

/* istanbul ignore next */
export const asyncDel = ({ state, action }) => "Not Implemented";

/* istanbul ignore next */
export const asyncGet = ({ state, action }) => "Not Implemented";

/* istanbul ignore next */
export const asyncUpdate = ({ state, action }) => "Not Implemented";
