import { useLocation, useNavigate } from "react-router-dom";

const SearchFilter = () => {
    const location = useLocation();
    /*   const {id} = useParams(); */
    const navigate = useNavigate();

    console.log(location);

    const query = new URLSearchParams(location.search);

    console.log(query);

    const skip = parseInt(query.get("skip")) || 0;
    const limit = parseInt(query.get("limit")) || 15;

    console.log(skip, limit);

    const handleNext = () => {
        console.log("Next");
        query.set("skip", skip);
        const newSkip = skip + limit;
        /*  query.set("limit", 15); */
        navigate(`/search?skip=${newSkip}&limit=${limit}`);
    };

    return (
        <>
            <div className="outlet-main">
               
            </div>
        </>
    );
};

export default SearchFilter;
