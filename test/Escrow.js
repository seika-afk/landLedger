const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
		let buyer ,seller,inspector,lender;
		let realEstate,escrow
//all the tests for escrow smart contract

	beforeEach(async ()=>{
	
		[buyer,seller,inspector,lender]=await ethers.getSigners() 
		//console.log(signers)
		//const  buyer=signers[0]
		//const seller=signers[1]
		//deploy realstate
		const RealEstate = await ethers.getContractFactory('RealEstate');
		 realEstate = await RealEstate.deploy();
		await realEstate.deployed();
		//console.log(realEstate.address);
			
		//mint
		let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/1.json")
		
		await transaction.wait()



		const Escrow=await ethers.getContractFactory('Escrow')
		escrow= await Escrow.deploy(

realEstate.address,
			seller.address,
			inspector.address,
			lender.address
		)




//approve property
	transaction = await realEstate.connect(seller).approve(escrow.address,1)

		await transaction.wait()

		//list property
		//
		transaction=await escrow.connect(seller).list(1)
		await transaction.wait()


	})

	describe('Deployment',()=>{

	it('Returns NFT Address',async ()=>{


		 result=await escrow.nftAddress();
		expect(result).to.be.equal(realEstate.address)

	})

	it('Returns seller',async ()=>{
	


		result=await escrow.seller()
		expect(result).to.be.equal(seller.address)


	})
		it('Returns lender',async ()=>{
	



		result=await escrow.lender()
		expect(result).to.be.equal(lender.address)
	})

	it('Returns inspector',async ()=>{
	



		result=await escrow.inspector()
		expect(result).to.be.equal(inspector.address)
	})

	}) 


	describe('listing',async ()=>{

		it('Updates ownership',async ()=>{
			expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address) 


		})
		

	})

	//it('saves the addreses',async()=>{});

})
