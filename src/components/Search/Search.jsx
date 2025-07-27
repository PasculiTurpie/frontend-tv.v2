import './Search.css'
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import { Field, Form, Formik } from 'formik';



const SchemaSearch = Yup.object().shape({
  searchFilter: Yup.string().trim("No debe tener espacios al inicio o al final")
})

const Search = () => {

  



  return (
    <>
      <Formik
        initialValues={{
          searchFilter: ""
        }}
        validationSchema={SchemaSearch}
        onSubmit={async (values, { resetForm }) => { 
          console.log(values)
        }}
      >
        <Form className='form__search'>

          <Field className='input__text-search' type="text" placeholder="Buscar" name="searchFilter"/>
        </Form>
      </Formik>
    </>
  )
}

export default Search