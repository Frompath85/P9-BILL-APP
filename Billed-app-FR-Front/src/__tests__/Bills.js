
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import user from "@testing-library/user-event"
import userEvent from "@testing-library/user-event";


import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

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
      expect(windowIcon).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
       /* On modifie le test pour qu'ils prennent en compte les bills comment ils sont rangés dans la vue */
      document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => (a.date < b.date) ? 1 : -1) })
      //document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("when i click on Eye icon of a bill",() => {
    test('the modal should appear',() => { 
      document.body.innerHTML = BillsUI({data: bills})
      const ModalExemple = new Bills({document, onNavigate, store: null, localStorage : window.localStorage})
      ModalExemple.handleClickIconEye = jest.fn()//mok function
      const ClickEyeButton = screen.getAllByTestId("icon-eye")[0]
      user.click(ClickEyeButton)
      expect(ModalExemple.handleClickIconEye).toBeCalled()
    })
    test("Then the modal should display the  image", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const ModalExemple = new Bills({ document, onNavigate, firestore: null, localStorage: window.localStorage })
      const iconEye = document.querySelector(`div[data-testid="icon-eye"]`)
      $.fn.modal = jest.fn()
      ModalExemple.handleClickIconEye(iconEye)
      expect($.fn.modal).toBeCalled()
      expect(document.querySelector(".modal")).toBeTruthy()
    })
  })

  describe("when i click on the NewBill Button",() => {
    test('the NewBill page should appear',() => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({pathname})
    }
    const bills = new Bills({document, onNavigate, store: null, localStorage: window.localStorage})
    const handleNewBill = jest.fn(e => bills.handleClickNewBill(e))
    document.body.innerHTML = BillsUI({ data: bills })
    const btnNewBill = screen.getByTestId("btn-new-bill")
    btnNewBill.addEventListener("click", handleNewBill)
    userEvent.click(btnNewBill)
    expect(handleNewBill).toHaveBeenCalled()
  })
  })

 // test d'intégration GET
 describe("When an error occurs on API", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills")
    Object.defineProperty(
        window,
        "localStorage",
        { value: localStorageMock }
    )
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee",
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })
  // Vérifie si l'erreur 404 s'affiche bien
  test("Then fetches bills from an API and fails with 404 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 404"))
        }
      }})
    const html = BillsUI({ error: "Erreur 404" })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })
// Vérifie si l'erreur 500 s'affiche bien
  test("Then fetches messages from an API and fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 500"))
        }
      }})
    const html = BillsUI({ error: "Erreur 500" })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })
})


})
