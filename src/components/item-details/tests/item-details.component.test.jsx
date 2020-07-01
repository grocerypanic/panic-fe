import React from "react";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { propCount } from "../../../test.fixtures/objectComparison";

import ItemDetails from "../item-details.component";
import ItemDetailsForm from "../../item-details-form/item-details-form.component";
import TransactionsOverview from "../../transactions/transactions.component";

import { HeaderContext } from "../../../providers/header/header.provider";
import initialHeaderSettings from "../../../providers/header/header.initial";

import Strings from "../../../configuration/strings";

jest.mock("../../transactions/transactions.component");
jest.mock("../../item-details-form/item-details-form.component");
ItemDetailsForm.mockImplementation(() => <div>MockItemDetailsForm</div>);
TransactionsOverview.mockImplementation(() => (
  <div>MockTransactionOverview</div>
));

const mockHeaderUpdate = jest.fn();

const mockTransactions = [{ id: 1, item: 1, date: "2019-09-15", quantity: 5 }];

const mockItem = {
  expired: 0,
  id: 1,
  name: "Vegan Cheese",
  next_expiry_date: "2020-06-15",
  next_expiry_quantity: 0,
  preferred_stores: [1],
  price: "4.00",
  quantity: 1,
  shelf: 2,
  shelf_life: 25,
};

const mockShelf = {
  id: 1,
  name: "Fridge",
};

const mockStore = {
  id: 1,
  name: "No Frills",
};

const props = {
  allItems: [mockItem],
  item: mockItem,
  headerTitle: "mockHeaderTitle",
  title: "mockTitle",
  helpText: Strings.Testing.GenericTranslationTestString,
  transaction: false,
  tr: [...mockTransactions],
  trStatus: false,
  stores: [mockStore],
  shelves: [mockShelf],
  handleSave: jest.fn(),
  handleDelete: jest.fn(),
  requestTransactions: jest.fn(),
};

const renderHelper = (currentProps) => {
  return render(
    <HeaderContext.Provider
      value={{ ...initialHeaderSettings, updateHeader: mockHeaderUpdate }}
    >
      <ItemDetails {...currentProps} />
    </HeaderContext.Provider>
  );
};

describe("Setup Environment", () => {
  let utils;
  let current;

  // Mock out the querySelector to allow detecting the item size
  beforeAll(() =>
    jest.spyOn(document, "querySelector").mockImplementation(() => {
      return {
        clientWidth: 200,
      };
    })
  );

  afterAll(() => document.querySelector.mockRestore());

  describe("outside of a transaction", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      current = { ...props, allItems: [...props.allItems] };
      utils = renderHelper(current);
    });
    afterEach(cleanup);

    it("renders, should call header with the correct params", () => {
      expect(current.transaction).toBe(false);

      expect(mockHeaderUpdate).toHaveBeenCalledTimes(1);
      expect(mockHeaderUpdate).toBeCalledWith({
        title: current.headerTitle,
        create: null,
        transaction: false,
        disableNav: false,
      });
    });

    it("renders, should create the tabs as expected", () => {
      expect(current.transaction).toBe(false);

      expect(utils.getByText(Strings.ItemDetails.Tabs.Stats)).toBeTruthy();
      expect(utils.getByText(Strings.ItemDetails.Tabs.Edit)).toBeTruthy();
    });

    it("renders, should should show the stats content as expected, and fetch transactions", async (done) => {
      expect(current.transaction).toBe(false);
      const tab1 = utils.getByText(Strings.ItemDetails.Tabs.Stats);
      const tab2 = utils.getByText(Strings.ItemDetails.Tabs.Edit);

      expect(props.requestTransactions).toBeCalledTimes(0);
      fireEvent.click(tab1, "click");
      await waitFor(() => expect(props.requestTransactions).toBeCalledTimes(1));

      expect(ItemDetailsForm).toBeCalledTimes(2);
      expect(tab1.className.search("active")).toBeGreaterThan(0);

      expect(TransactionsOverview).toBeCalledTimes(2);
      expect(tab2.className.search("active")).toBeLessThan(0);

      done();
    });

    it("renders, should should show the edit content as expected", async (done) => {
      expect(current.transaction).toBe(false);
      const tab1 = utils.getByText(Strings.ItemDetails.Tabs.Stats);
      const tab2 = utils.getByText(Strings.ItemDetails.Tabs.Edit);
      fireEvent.click(tab2, "click");

      expect(ItemDetailsForm).toBeCalledTimes(1);
      expect(tab2.className.search("active")).toBeGreaterThan(0);

      expect(TransactionsOverview).toBeCalledTimes(1);
      expect(tab1.className.search("active")).toBeLessThan(0);

      done();
    });

    it("renders, should call ItemDetailsForm as expected", async (done) => {
      expect(current.transaction).toBe(false);

      expect(ItemDetailsForm).toBeCalledTimes(1);
      const call = ItemDetailsForm.mock.calls[0][0];
      propCount(call, 9);

      expect(call.allItems).toBe(current.allItems);
      expect(call.item).toBe(mockItem);
      expect(call.title).toBe(current.title);
      expect(call.helpText).toBe(current.helpText);
      expect(call.transaction).toBe(false);
      expect(call.stores).toStrictEqual([mockStore]);
      expect(call.shelves).toStrictEqual([mockShelf]);
      expect(call.handleSave).toBe(current.handleSave);
      expect(call.handleDelete).toBe(current.handleDelete);

      done();
    });

    it("renders, should call TransactionsOverview as expected", async (done) => {
      expect(current.transaction).toBe(false);

      expect(TransactionsOverview).toBeCalledTimes(1);
      const call = TransactionsOverview.mock.calls[0][0];
      propCount(call, 3);

      expect(call.ready).toBe(false);
      expect(call.item).toBe(mockItem);
      expect(call.tr).toStrictEqual(mockTransactions);

      done();
    });
  });

  describe("during a transaction", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      current = { ...props, transaction: true };
      utils = renderHelper(current);
    });
    afterEach(cleanup);

    it("renders, should call header with the correct params", () => {
      expect(current.transaction).toBe(true);

      expect(mockHeaderUpdate).toHaveBeenCalledTimes(1);
      expect(mockHeaderUpdate).toBeCalledWith({
        title: current.headerTitle,
        create: null,
        transaction: true,
        disableNav: false,
      });
    });

    it("renders, should still navigate to the stats page", async (done) => {
      expect(current.transaction).toBe(true);
      const tab1 = utils.getByText(Strings.ItemDetails.Tabs.Stats);
      const tab2 = utils.getByText(Strings.ItemDetails.Tabs.Edit);
      fireEvent.click(tab1, "click");

      expect(ItemDetailsForm).toBeCalledTimes(2);
      expect(tab1.className.search("active")).toBeGreaterThan(0); // Selected By Default

      expect(TransactionsOverview).toBeCalledTimes(2);
      expect(tab2.className.search("active")).toBeLessThan(0);

      done();
    });

    it("should respond to a screen orientation change by flipping back to the edit tab", async (done) => {
      expect(current.transaction).toBe(true);
      const tab1 = utils.getByText(Strings.ItemDetails.Tabs.Stats);
      const tab2 = utils.getByText(Strings.ItemDetails.Tabs.Edit);
      fireEvent.click(tab2, "click");
      fireEvent(window, new Event("orientationchange"));

      expect(TransactionsOverview).toBeCalledTimes(1);
      expect(tab2.className.search("active")).toBeGreaterThan(0); // Selected By Default

      expect(ItemDetailsForm).toBeCalledTimes(1);
      expect(tab1.className.search("active")).toBeLessThan(0);

      done();
    });

    it("renders, should call ItemDetailsForm as expected", async (done) => {
      expect(current.transaction).toBe(true);

      expect(ItemDetailsForm).toBeCalledTimes(1);
      const call = ItemDetailsForm.mock.calls[0][0];
      propCount(call, 9);

      expect(call.allItems).toBe(current.allItems);
      expect(call.item).toBe(mockItem);
      expect(call.title).toBe(current.title);
      expect(call.helpText).toBe(current.helpText);
      expect(call.transaction).toBe(true);
      expect(call.stores).toStrictEqual([mockStore]);
      expect(call.shelves).toStrictEqual([mockShelf]);
      expect(call.handleSave).toBe(current.handleSave);
      expect(call.handleDelete).toBe(current.handleDelete);

      done();
    });

    it("renders, should call TransactionsOverview as expected", async (done) => {
      expect(current.transaction).toBe(true);

      expect(TransactionsOverview).toBeCalledTimes(1);
      const call = TransactionsOverview.mock.calls[0][0];
      propCount(call, 3);

      expect(call.ready).toBe(false);
      expect(call.item).toBe(mockItem);
      expect(call.tr).toStrictEqual(mockTransactions);

      done();
    });
  });
});