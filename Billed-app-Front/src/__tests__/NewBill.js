/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes";

// POST New bill

jest.mock("../app/store", () => mockStore);

beforeEach(() => {
  localStorage.setItem(
    "user",
    JSON.stringify({ type: "Employee", email: "a@a" })
  );
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
});

afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = "";
});

const file = new File(["facture"], "facture.png", { type: "image/png" });

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("then if I upload an image, the new file should be uploaded", () => {
      const fileInput = screen.getByTestId("file");
      userEvent.upload(fileInput, file);
      expect(fileInput.files[0]).toStrictEqual(file);
      expect(fileInput.files.item(0)).toStrictEqual(file);
      expect(fileInput.files).toHaveLength(1);
    });
  });

  describe("When I fill the bill's form and click on 'envoyer'", () => {
    const date = new Date();
    test("the form is submitted", async () => {
      userEvent.click(screen.getByTestId("expense-type"));
      userEvent.click(screen.getByText("Transports"));
      userEvent.type(screen.getByTestId("expense-name"), "facture");
      screen.getByTestId("datepicker").value = date;
      userEvent.type(screen.getByTestId("amount"), "999");
      userEvent.type(screen.getByTestId("vat"), "20");
      userEvent.type(screen.getByTestId("pct"), "1");
      userEvent.type(
        screen.getByTestId("commentary"),
        "Commentaire de la facture."
      );
      userEvent.upload(screen.getByTestId("file"), file);
      userEvent.click(screen.getByText("Envoyer"));
      expect(await screen.findByText("Mes notes de frais")).toBeTruthy();
    });
  });
});