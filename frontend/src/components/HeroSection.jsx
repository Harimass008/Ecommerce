import { fallbackImages } from '../utils.js';

export default function HeroSection({ setModal, setForm }) {
  return <section className="hero">
    <div className="hero-copy">
      <div className="eyebrow"><span></span> THE MARKETPLACE, REIMAGINED</div>
      <h1>Find your next<br/><em>favorite thing.</em></h1>
      <p>Discover independent sellers and thoughtful products, all in one place.</p>
      <div className="hero-actions">
        <button className="primary" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>Explore products <span>↗</span></button>
        <button className="secondary" onClick={() => { setModal('register'); setForm(f => ({ ...f, role: 'seller' })); }}>Become a seller</button>
      </div>
      <div className="hero-stats"><div><strong>Local</strong><span>seller community</span></div><div><strong>Curated</strong><span>marketplace finds</span></div><div><strong>Secure</strong><span>account access</span></div></div>
    </div>
    <div className="hero-art"><div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
      <div className="hero-product product-main"><img src={fallbackImages[0]} alt="Minimal wristwatch"/><span>TIMELESS DESIGN</span></div>
      <div className="floating-card floating-top"><span className="float-icon">✦</span><div><strong>Made to be found</strong><small>Discover something new</small></div></div>
      <div className="floating-card floating-bottom"><span className="float-icon green">↗</span><div><strong>Independent sellers</strong><small>Big ideas, small businesses</small></div></div>
      <div className="hero-sticker">GOOD<br/>FINDS<br/><span>ONLY.</span></div>
    </div>
  </section>;
}
