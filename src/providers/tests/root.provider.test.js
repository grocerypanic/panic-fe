import React from "react";
import { render, cleanup } from "@testing-library/react";

import RootProvider from "../root.provider";

import AnalyticsProvider from "../analytics/analytics.provider";
import HeaderProvider from "../header/header.provider";

import ActivityProvider from "../api/activity/activity.provider";
import ItemProvider from "../api/item/item.provider";
import ShelfProvider from "../api/shelf/shelf.provider";
import StoreProvider from "../api/store/store.provider";
import TransactionProvider from "../api/transaction/transaction.provider";

import UserProvider from "../user/user.provider";

jest.mock("../api/activity/activity.provider");
jest.mock("../analytics/analytics.provider");
jest.mock("../header/header.provider");
jest.mock("../api/item/item.provider");
jest.mock("../api/shelf/shelf.provider");
jest.mock("../api/store/store.provider");
jest.mock("../api/transaction/transaction.provider");
jest.mock("../user/user.provider");

ActivityProvider.mockImplementation(({ children }) => children);
AnalyticsProvider.mockImplementation(({ children }) => children);
HeaderProvider.mockImplementation(({ children }) => children);
ItemProvider.mockImplementation(({ children }) => children);
ShelfProvider.mockImplementation(({ children }) => children);
StoreProvider.mockImplementation(({ children }) => children);
TransactionProvider.mockImplementation(({ children }) => children);

UserProvider.mockImplementation(({ children }) => children);

let utils;

beforeEach(() => {
  jest.clearAllMocks();
  utils = render(
    <RootProvider>
      <div>Missing Ingredients</div>
    </RootProvider>
  );
});

afterEach(cleanup);

it("should render with the correct message", () => {
  expect(AnalyticsProvider).toHaveBeenCalledTimes(1);
  expect(HeaderProvider).toHaveBeenCalledTimes(1);

  expect(ActivityProvider).toHaveBeenCalledTimes(1);
  expect(ShelfProvider).toHaveBeenCalledTimes(1);
  expect(ItemProvider).toHaveBeenCalledTimes(1);
  expect(StoreProvider).toHaveBeenCalledTimes(1);
  expect(TransactionProvider).toHaveBeenCalledTimes(1);

  expect(utils.findByText("Missing Ingredients")).toBeTruthy();
});
