import HeroSection from '../components/HeroSection.jsx';
import ProductCatalog from '../components/ProductCatalog.jsx';
import SellerCTA from '../components/SellerCTA.jsx';

export default function ShopPage({ products, search, setSearch, categories, category, setCategory, addToCart, setModal, setForm }) {
  return <><HeroSection setModal={setModal} setForm={setForm}/><ProductCatalog products={products} search={search} setSearch={setSearch} categories={categories} category={category} setCategory={setCategory} addToCart={addToCart}/><SellerCTA setModal={setModal} setForm={setForm}/></>;
}
