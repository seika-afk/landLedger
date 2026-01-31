import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from "./components/Home"

// ABIs
import RealEstate from './abis/RealEstate.json';
import Escrow from './abis/Escrow.json';

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [home, setHome] = useState([]); // initialize as empty array
  const [account, setAccount] = useState(null);
const [toggle,setToggle]=useState(false);
	const [homie,setHomie]=useState(null)
  const loadBlockchainData = async () => {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x7A69' }], // 31337 in hex
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();
    console.log("APP SEES CHAIN ID:", network.chainId);

    const realEstate = new ethers.Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      provider
    );

    const totalSupply = await realEstate.totalSupply();
    console.log(totalSupply.toString());

    const homes = [];
    for (let i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      try {
        const response = await fetch(uri);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const metadata = await response.json();
        homes.push(metadata);
      } catch (e) {
        console.error("Failed to fetch", uri, e);
      }
    }

    setHome(homes);
    console.log("seeing homes", homes);

    const escrow = new ethers.Contract(
      config[network.chainId].escrow.address,
      Escrow,
      provider
    );
    setEscrow(escrow);

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(ethers.utils.getAddress(accounts[0]));
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);


	const toggleProp = (item)=>{

setHomie(item)
		toggle?setToggle(false):setToggle(true)
	}

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className='cards__section'>
        <h3>Homes for you</h3>
        <hr />
        <div className='cards'>
          {home.length > 0 ? (
            home.map((item, index) => (
              <div className='card' key={index} onClick={()=>toggleProp(item)}>
                <div className='card__image'>
                  <img src={item.image || ""} alt="Home" />
                </div>
                <div className='card__info'>
                  <h4>{item.attributes?.[0]?.value || "1 ETH"}</h4>
                  <p>
                    <strong>{item.attributes?.[2]?.value || 1}</strong> bds |{' '}
                    <strong>{item.attributes?.[3]?.value || 2}</strong> ba |{' '}
                    <strong>{item.attributes?.[4]?.value || 3}</strong> sqrft
                  </p>
                  <p>{item.address || "1234 Elm St"}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Loading homes...</p>
          )}
        </div>
      </div>

	  {toggle && <Home home={homie} provider={provider} account={account} escrow={escrow} togglePop={toggleProp}/>}

    </div>
  );
}

export default App;

