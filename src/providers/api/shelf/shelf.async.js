import { Paths } from "../../../configuration/backend";
import { match2xx, match400duplicate } from "../../../util/requests/status";
import Request from "../../../util/requests";
import ApiActions from "../api.actions";
import {
  authFailure,
  duplicateObject,
  asyncDispatch,
  calculateListUrl,
  retrieveResults,
} from "../api.async.helpers";

import { generateConverter } from "../api.util.js";
import InitialState from "./shelf.initial";

const convertDatesToLocal = generateConverter(InitialState.class);

export const asyncAdd = async ({ state, action }) => {
  const { dispatch, callback } = action;
  const [response, status] = await Request("POST", Paths.manageShelves, {
    name: action.payload.name,
  });
  // Status Code is 2xx
  if (match2xx(status)) {
    new Promise((resolve) => {
      const newInventory = [...state.inventory];
      newInventory.push(convertDatesToLocal(response));
      dispatch({
        type: ApiActions.SuccessAdd,
        payload: {
          inventory: [...newInventory],
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

export const asyncDel = async ({ state, action }) => {
  const { dispatch, callback } = action;
  const [, status] = await Request(
    "DELETE",
    Paths.manageShelves + `${action.payload.id}/`
  );
  // Status Code is 2xx
  if (match2xx(status)) {
    new Promise((resolve) => {
      dispatch({
        type: ApiActions.SuccessDel,
        payload: {
          inventory: state.inventory.filter(
            (item) => item.id !== action.payload.id
          ),
        },
        callback,
      });
    });
    return;
  }
  if (status === 401) return authFailure(dispatch, callback);
  asyncDispatch(dispatch, {
    type: ApiActions.FailureDel,
    callback,
  });
  return;
};

export const asyncList = async ({ state, action }) => {
  const { dispatch, callback } = action;

  const [response, status] = await Request(
    "GET",
    calculateListUrl(action, Paths.manageShelves)
  );
  if (match2xx(status)) {
    new Promise((resolve) => {
      const processedResponse = retrieveResults(response).map((i) =>
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
export const asyncGet = ({ state, action }) => "Not Implemented";

/* istanbul ignore next */
export const asyncUpdate = ({ state, action }) => "Not Implemented";
