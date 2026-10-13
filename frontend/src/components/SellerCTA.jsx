export default function SellerCTA({ setModal, setForm }) {
  return <section className="seller-cta"><div><div className="eyebrow">YOUR STORE STARTS HERE</div><h2>Have something<br/><em>worth sharing?</em></h2><p>Bring your products to a marketplace built for independent sellers.</p><button className="light-button" onClick={() => { setForm(f => ({ ...f, role: 'seller' })); setModal('register'); }}>Open your store <span>↗</span></button></div><div className="cta-shape"><span>SELL</span><span>GOOD</span><span>THINGS.</span></div></section>;
}
