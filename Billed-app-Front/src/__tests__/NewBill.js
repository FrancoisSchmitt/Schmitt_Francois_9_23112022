/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from '../__mocks__/localStorage'
import BillsUI from '../views/BillsUI.js'
import NewBillUI from '../views/NewBillUI'
import NewBill from '../containers/NewBill'

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

const fileImg = new File(["facture"], "facture.png", { type: "image/png" });


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("then if I upload an image, the new file should be uploaded", () => {
      const fileInput = screen.getByTestId("file");
      userEvent.upload(fileInput, fileImg);
      expect(fileInput.files[0]).toStrictEqual(fileImg);
      expect(fileInput.files.item(0)).toStrictEqual(fileImg);
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
      userEvent.upload(screen.getByTestId("file"), fileImg);
      userEvent.click(screen.getByText("Envoyer"));
      expect(await screen.findByText("Mes notes de frais")).toBeTruthy();
    });
  });
});




// // Test d'intégration POST
describe('Given I am connected as an employee', () => {
  describe('When I add a new bill', () => {
    test('fetches bills from mock API POST', async () => {
      jest.spyOn(mockStore.bills(), 'update')
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('click', handleSubmit)
      fireEvent.click(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(form).toBeTruthy()
    })
  })
  test('Then it fails with a 404 message error', async () => {
    const html = BillsUI({ error: 'Erreur 404' })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })
  test('Then it fails with a 500 message error', async () => {
    const html = BillsUI({ error: 'Erreur 500' })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })
})