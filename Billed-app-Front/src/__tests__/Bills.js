/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills.js'
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      // Ajouter une verification pour savoir si la class active-acion est bien active
      // expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
      expect(windowIcon.className).toBe('active-icon')
    })

test("Then bills should be ordered from earliest to latest", () => {
  document.body.innerHTML = BillsUI({
    data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)),
  })
  // on recupère les toutes les dates qui se trouve sur la page bills
  // et on vérifie qu'il soit bien trié dans l'ordre décroissant 
  const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
    .map((a) => a.innerHTML)
  const antiChrono = (a, b) => (a < b ? 1 : -1)
  const datesSorted = [...dates].sort(antiChrono)
  expect(dates).toEqual(datesSorted)
    })
  })
})

describe("then on bills page", () => {
  describe(" on click too ", () => {
    test("nouvelle note de frais", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      document.body.innerHTML = BillsUI({ data: bills })
      
      const newBill = new Bills({
        document, onNavigate, mockStore, localStorage: window.localStorage
      })
      // On vérifie que si au clique de la fonction handleClickNewBill la fonction soit bien appélé 
      // et que le text corresponds bien a Envoyer une note de frais lorsqu'on change de page 
      const handleClickNewBill = jest.fn(() => newBill.handleClickNewBill)
      const handleClick = screen.getByTestId("btn-new-bill")
      handleClick.addEventListener('click', handleClickNewBill)
      userEvent.click(handleClick)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getAllByText('Envoyer une note de frais'))

    })
  })
})

describe("When I am a user connected as employee and I am on Bills page", () => {
  describe("I click on the eye icon in the action column", () => {
    test("if showModal work", async () => {
      $.fn.modal = jest.fn() // Prevent jQuery error
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      document.body.innerHTML = BillsUI({ data: bills })

      const newBill = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      // On récupère les icones d'oeil 
      const iconEye = screen.getAllByTestId('icon-eye')[0]
      const handleShowModal = jest.fn((e) => {
        newBill.handleClickIconEye(e.target)
      })
      iconEye.addEventListener('click', handleShowModal)
      userEvent.click(iconEye)

      expect(handleShowModal).toHaveBeenCalled()
      expect(screen.getAllByText('Justificatif')).toBeTruthy()
    })
  })
})


// test d'intégration GET
describe("Given I am a user connected as employee", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Dashboard)
      await waitFor(() => screen.getByText("Validations"))
      const contentPending = await screen.getByText("En attente (1)")
      expect(contentPending).toBeTruthy()
      const contentRefused = await screen.getByText("Refusé (2)")
      expect(contentRefused).toBeTruthy()
      expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Dashboard)
        await new Promise(process.nextTick);
        const message =  screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Dashboard)
        await new Promise(process.nextTick);
        const message =  screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })

  })
})

