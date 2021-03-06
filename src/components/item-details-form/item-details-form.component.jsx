// For editing existing components, then will add create functionality

import React from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/Form";

import { useTranslation } from "react-i18next";

import Alert from "../alert/alert.component";
import Hint from "../hint/hint.component";
import FormInput from "../form-input/form-input.component";
import DropDown from "../form-dropdown/form-dropdown.component";
import MultiDropDown from "../form-multiselect/form-multiselect.component";

import { Paper } from "../../global-styles/containers";
import { Banner } from "../../global-styles/banner";
import { FormBox, Outline, ButtonBox } from "./item-details-form.styles";

import { Constants, ShelfLifeConstants } from "../../configuration/backend";
import { ui } from "../../configuration/theme";

import {
  normalizeNameArray,
  normalizeName,
  normalizeId,
  normalizeShelfLifeName,
} from "./item-details-form.utils";

const ItemDetailsForm = ({
  item,
  allItems,
  title,
  helpText,
  transaction,
  stores,
  shelves,
  handleSave,
  handleDelete,
  duplicate,
  setDuplicate,
}) => {
  const { t } = useTranslation();

  // Create State For Each Form Component
  const [nameState, setNameState] = React.useState("");
  const [quantityState, setQuantityState] = React.useState("");
  const [priceState, setPriceState] = React.useState("");
  const [shelfLifeState, setShelfLifeState] = React.useState("");
  const [preferredStoresState, setPreferredStoresState] = React.useState([]);
  const [shelfState, setShelfState] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [shelfOptions, setShelfOptions] = React.useState([]);
  const [actionMsg, setActionMsg] = React.useState(null);

  const bootstrapStrapWidthHack = () => {
    if (window.innerWidth < 380) return "col-5";
    return "col-6";
  };
  const [priceBootstrapWidth, setPriceBootstrapWidth] = React.useState(
    bootstrapStrapWidthHack()
  );
  const updatePriceWidth = () =>
    setPriceBootstrapWidth(bootstrapStrapWidthHack());

  // Normalize the api data as it comes in
  React.useEffect(() => {
    setNameState(item.name);
    setQuantityState(item.quantity);
    setPriceState(item.price);
    setShelfLifeState(normalizeShelfLifeName(item.shelf_life));
    setPreferredStoresState(normalizeNameArray(item.preferred_stores, stores));
    setShelfState(normalizeName(item.shelf, shelves));
  }, [item, stores, shelves]);

  React.useEffect(() => {
    if (duplicate) {
      setErrorMsg(t("SimpleList.ValidationAlreadyExists"));
      setDuplicate(false);
      setActionMsg(null);
      setTimeout(() => setErrorMsg(null), ui.alertTimeout);
    }
  }, [duplicate]); // eslint-disable-line

  // The data from the api may include a non standard shelf-life option
  // Normalize the shelf options and create a new custom entry if needed
  React.useEffect(() => {
    const options = [...ShelfLifeConstants];
    const search = options.findIndex((o) => o.id === item.shelf_life);
    if (search >= 0) {
      setShelfOptions(options);
    } else {
      setShelfOptions([
        ...options,
        { name: `${item.shelf_life} Days`, id: item.shelf_life },
      ]);
    }
  }, [shelves]); // eslint-disable-line

  React.useEffect(() => {
    window.addEventListener("resize", updatePriceWidth);
    return () => {
      window.removeEventListener("resize", updatePriceWidth);
    };
  }, []); // eslint-disable-line

  // Reassemble the form data into an object and pass back to handleSave
  // Perform validation as needed
  const handleSubmit = () => {
    if (transaction) return;
    const derivedShelfLife = normalizeId(shelfLifeState, ShelfLifeConstants);
    if (preferredStoresState.length === 0) {
      setErrorMsg(t("ItemDetails.ErrorUnselectedStore"));
      return setTimeout(() => setErrorMsg(null), ui.alertTimeout);
    }
    const newItem = {
      id: item.id,
      name: nameState,
      quantity: quantityState,
      price: priceState,
      shelf_life: derivedShelfLife ? derivedShelfLife : item.shelf_life,
      preferred_stores: preferredStoresState.map((o) => o.id),
      shelf: normalizeId(shelfState, shelves),
    };
    handleSave(newItem);
    setActionMsg(t("ItemDetails.SaveAction"));
    return setTimeout(() => setActionMsg(null), ui.alertTimeout);
  };

  const handleDeleteButton = (e) => {
    if (transaction) return;
    handleDelete(item);
    setActionMsg(t("ItemDetails.DeleteAction"));
  };

  return (
    <>
      <Paper>
        {errorMsg ? (
          <Banner className="alert alert-danger">{errorMsg}</Banner>
        ) : (
          <Banner className="alert alert-success">{title}</Banner>
        )}
        <Outline>
          <FormBox>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <Form.Group className="row">
                <FormInput
                  setErrorMsg={setErrorMsg}
                  storeState={nameState}
                  handleState={setNameState}
                  fieldName="name"
                  item={item}
                  transaction={transaction}
                  type="text"
                  label={`${t("ItemDetails.NameLabel")}:`}
                  details={""}
                  itemColumn={"col-10"}
                  minLength={2}
                  maxLength={24}
                />
              </Form.Group>
              <Form.Group className="row">
                <FormInput
                  setErrorMsg={setErrorMsg}
                  storeState={quantityState}
                  handleState={setQuantityState}
                  fieldName="quantity"
                  item={item}
                  transaction={transaction}
                  type="number"
                  label={`${t("ItemDetails.QuantityLabel")}`}
                  details={""}
                  labelColumn={"col-1"}
                  itemColumn={"col-4"}
                  min={Constants.minimumQuanity}
                  max={Constants.maximumQuantity}
                  step="1"
                  readOnly={true}
                />
                <FormInput
                  setErrorMsg={setErrorMsg}
                  storeState={priceState}
                  handleState={setPriceState}
                  fieldName="price"
                  item={item}
                  transaction={transaction}
                  type="number"
                  label={`${t("ItemDetails.PriceLabel")}`}
                  details={""}
                  labelColumn={"col-1"}
                  itemColumn={priceBootstrapWidth}
                  min={Constants.minimumPrice}
                  max={Constants.maximumPrice}
                  step="0.01"
                />
              </Form.Group>
              <Form.Group className="row">
                <DropDown
                  setErrorMsg={setErrorMsg}
                  storeState={shelfLifeState}
                  handleState={setShelfLifeState}
                  fieldName="shelf_life"
                  options={shelfOptions}
                  transaction={transaction}
                  details={t("ItemDetails.ShelfLifeDetail")}
                  labelColumn={""}
                  itemColumn={"col-12"}
                />
              </Form.Group>
              <Form.Group className="row">
                <MultiDropDown
                  setErrorMsg={setErrorMsg}
                  storeState={preferredStoresState}
                  handleState={setPreferredStoresState}
                  fieldName="preferred_stores"
                  options={stores}
                  transaction={transaction}
                  details={t("ItemDetails.PerferredLocationDetails")}
                  labelColumn={""}
                  itemColumn={"col-12"}
                />
              </Form.Group>
              <Form.Group className="row">
                <DropDown
                  setErrorMsg={setErrorMsg}
                  storeState={shelfState}
                  handleState={setShelfState}
                  fieldName="shelf"
                  options={shelves}
                  transaction={transaction}
                  details={t("ItemDetails.ShelvesDetail")}
                  labelColumn={""}
                  itemColumn={"col-12"}
                />
              </Form.Group>
              <ButtonBox>
                {handleDelete ? (
                  <button
                    data-testid="delete"
                    type="button"
                    className={`btn ${
                      transaction ? "btn-secondary" : "btn-danger"
                    }`}
                    onClick={handleDeleteButton}
                  >
                    {t("ItemDetails.DeleteButton")}
                  </button>
                ) : (
                  <div></div>
                )}
                <button
                  data-testid="submit"
                  type="submit"
                  className={`btn ${
                    transaction ? "btn-secondary" : "btn-success"
                  }`}
                >
                  {t("ItemDetails.SaveButton")}
                </button>
              </ButtonBox>
            </Form>
          </FormBox>
        </Outline>
      </Paper>
      <Alert message={actionMsg} />
      <Hint>{helpText}</Hint>
    </>
  );
};

export default ItemDetailsForm;

ItemDetailsForm.propTypes = {
  allItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  item: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  helpText: PropTypes.string.isRequired,
  transaction: PropTypes.bool.isRequired,
  stores: PropTypes.arrayOf(PropTypes.object).isRequired,
  shelves: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleSave: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  duplicate: PropTypes.bool.isRequired,
  setDuplicate: PropTypes.func.isRequired,
};
