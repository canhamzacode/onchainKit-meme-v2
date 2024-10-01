import Image from "next/image";
import { TokenListResponse } from "~/types/coingecko";
import { Token } from "@coinbase/onchainkit/token";
import { useState } from "react";
import { useAccount } from "wagmi";
import { api } from "~/utils/api";

interface TokenTableProps {
  tokens: TokenListResponse[]; // Expecting an array of TokenListResponse
  onTokenSelected: (token: Token) => void; // Callback function when a token is selected
}

const MemeTable: React.FC<TokenTableProps> = ({ tokens, onTokenSelected }) => {
  const { address } = useAccount(); // Fetch user wallet address
  const [currentPage, setCurrentPage] = useState(1); // State for the current page
  const itemsPerPage = 10; // Number of items to display per page
  const fetchTokenAddress = api.coingecko.getTokenByIdQuery.useMutation(); // Hook for fetching token address

  // Ensure tokens is defined to avoid TypeError
  const validTokens = Array.isArray(tokens) ? tokens : [];
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTokens = validTokens.slice(indexOfFirstItem, indexOfLastItem); // Safely slice the tokens array
  const totalPages = Math.ceil(validTokens.length / itemsPerPage); // Calculate total pages

  const selectToken = async (tokenListResponse: TokenListResponse) => {
    const tokenData = await fetchTokenAddress.mutateAsync({
      id: tokenListResponse.id,
    });

    console.log("Token Data:", tokenData.detail_platforms); // Log the entire response
    const baseToken = tokenData.detail_platforms.base; // Get the base token from the API response
    console.log("Base Token:", baseToken);
    if (!baseToken) return; // Exit if base token does not exist

    // Call the onTokenSelected callback with the selected token details
    onTokenSelected({
      address: baseToken.contract_address as `0x${string}`,
      chainId: 8453,
      decimals: baseToken.decimal_place,
      name: tokenListResponse.name,
      symbol: tokenListResponse.symbol,
      image: tokenListResponse.image,
    });
  };

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber); // Change the current page

  const handleTokenSelection = async (token: TokenListResponse) => {
    if (address) {
      try {
        await selectToken(token); // Select the token if wallet is connected
      } catch (error) {
        console.error("Error selecting token:", error); // Log any errors
      }
    } else {
      alert("Please connect your wallet to swap"); // Alert if wallet is not connected
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded-lg bg-white shadow-md">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">24h %</th>
              <th className="px-4 py-2">Market Cap</th>
              <th className="px-4 py-2">Volume</th>
            </tr>
          </thead>
          <tbody>
            {currentTokens.map((token) => (
              <tr key={token.id} onClick={() => handleTokenSelection(token)} className="border-b hover:bg-gray-100 cursor-pointer">
                <td className="px-4 py-2 flex items-center">
                  <Image src={token.image} alt={token.name} width={24} height={24} className="w-6 h-6 mr-2" />
                  {token.name}
                </td>
                <td className="px-4 py-2">${token.current_price.toFixed(2)}</td>
                <td className="px-4 py-2">{token.price_change_percentage_24h?.toFixed(2)}%</td>
                <td className="px-4 py-2">${token.market_cap.toLocaleString()}</td>
                <td className="px-4 py-2">${token.total_volume.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        {/* Pagination controls could be added here */}
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MemeTable;
