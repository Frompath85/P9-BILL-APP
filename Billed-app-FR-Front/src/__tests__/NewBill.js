import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import userEvent from "@testing-library/user-event"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then i expect the title of the page to be 'Envoyer une note de frais'", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const title = screen.getByText("Envoyer une note de frais").textContent.trim();
      expect(title).toBe("Envoyer une note de frais");
    })

    test("Then a form with nine fields should be rendered", () => {
      document.body.innerHTML = NewBillUI()
      const form = document.querySelector("form")
      expect(form.length).toEqual(9)
    })

   //je verifie si un ficher est bien appelé dans le input et il est bien chargé 
    test("Then verify the file bill", ()=>{
      jest.spyOn(mockStore, "bills")
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }      

      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      const html = NewBillUI()
      document.body.innerHTML = html

      const newBillInit= new NewBill({document, onNavigate, store: mockStore, localStorage:window.localStorage})
      const file = new File(['image'], 'image.png', {type: 'image/png'});
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      const formNewBill = screen.getByTestId("form-new-bill")
      const billFile = screen.getByTestId('file');

      billFile.addEventListener("change", handleChangeFile);     
      userEvent.upload(billFile, file)
      
      expect(billFile.files[0].name).toBeDefined()
      expect(handleChangeFile).toBeCalled()

      // le ficher est bien chargé
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);     
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})