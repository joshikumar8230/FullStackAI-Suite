import { useEffect, useState } from "react";
import axios from "axios";

function ViewAutoCategoryPage(){

const [products,setProducts] = useState([]);
const [loading,setLoading] = useState(true);

const [currentPage,setCurrentPage] = useState(1);
const rowsPerPage = 8;

useEffect(()=>{

  const fetchProducts = async ()=>{

    try{

      const token = sessionStorage.getItem("token");

      const res = await axios.get(
        "https://fullstackai-suite.onrender.com/products",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      setProducts(res.data.data);

    }
    catch(err){

      console.error("Failed to fetch products");

    }
    finally{

      setLoading(false);

    }

  };

  fetchProducts();

},[]);


/* Pagination Logic */

const indexOfLastRow = currentPage * rowsPerPage;
const indexOfFirstRow = indexOfLastRow - rowsPerPage;

const currentProducts = products.slice(indexOfFirstRow,indexOfLastRow);

const totalPages = Math.ceil(products.length / rowsPerPage);


return(

<div style={{
padding:"40px",
fontFamily:"Arial"
}}>

<h2 style={{marginBottom:"20px"}}>Saved Auto Categories</h2>

{loading && <p>Loading products...</p>}

{!loading && products.length === 0 && (
<p>No products saved yet.</p>
)}

{!loading && products.length > 0 && (

<>

<table
style={{
width:"100%",
borderCollapse:"collapse",
boxShadow:"0 5px 15px rgba(0,0,0,0.1)"
}}
>

<thead>
<tr style={{background:"#007bff",color:"white"}}>

<th style={cellStyle}>Product Name</th>
<th style={cellStyle}>Primary Category</th>
<th style={cellStyle}>Sub Category</th>
<th style={cellStyle}>SEO Tags</th>
<th style={cellStyle}>Sustainability Filters</th>

</tr>
</thead>

<tbody>

{currentProducts.map((product)=>(
<tr key={product._id} style={{background:"#fff"}}>

<td style={cellStyle}>{product.product_name}</td>

<td style={cellStyle}>{product.primary_category}</td>

<td style={cellStyle}>{product.sub_category}</td>

<td style={cellStyle}>
{product.seo_tags.join(", ")}
</td>

<td style={cellStyle}>
{product.sustainability_filters.join(", ")}
</td>

</tr>
))}

</tbody>

</table>

<div style={{
marginTop:"20px",
display:"flex",
justifyContent:"center",
gap:"10px"
}}>

<button
disabled={currentPage === 1}
onClick={()=>setCurrentPage(currentPage-1)}
style={buttonStyle}
>
Prev
</button>

<span style={{alignSelf:"center"}}>
Page {currentPage} of {totalPages}
</span>

<button
disabled={currentPage === totalPages}
onClick={()=>setCurrentPage(currentPage+1)}
style={buttonStyle}
>
Next
</button>

</div>

</>

)}

</div>

);

}

const cellStyle = {
border:"1px solid #ddd",
padding:"10px",
textAlign:"left"
};

const buttonStyle = {
padding:"6px 12px",
border:"none",
background:"#007bff",
color:"white",
borderRadius:"5px",
cursor:"pointer"
};

export default ViewAutoCategoryPage;