import "./Search.css";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import { Field, Form, Formik } from "formik";
import SearchFilter from "../SearchFilter/SearchFilter";
import { useState } from "react";


const SchemaSearch = Yup.object().shape({
    searchFilter: Yup.string().trim(
        "No debe tener espacios al inicio o al final"
    ),
});



const Search = () => {


  const [searchFilterData, setSearchFilterData] = useState('')
  

    return (
        <>
            <Formik
                initialValues={{
                    searchFilter: "",
                }}
                validationSchema={SchemaSearch}
                onSubmit={async (values, { resetForm }) => {
                  try {
                    setSearchFilterData(values)
                        console.log(values);
                        resetForm();
                    } catch (error) {
                        console.error(error);
                  }
                  console.log(searchFilterData)
          }}
          
            >
                <Form className="form__search">
                    <Field
                        className="input__text-search"
                        type="text"
                        placeholder="Buscar"
              name="searchFilter"
              onChange={(e) => {
                console.log(e.target.value)
              }}
                    />
                </Form>
        </Formik>
        
        </>
    );
};

export default Search;
