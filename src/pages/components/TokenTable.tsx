import Image from "next/image";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import type { TokenListResponse } from "~/types/coingecko";
import { api } from "~/utils/api";
import { Token } from "@coinbase/onchainkit/token";
import { useAccount } from "wagmi";
import { FaSortDown, FaSortUp } from "react-icons/fa";

interface TokenTableProps {
  tokens: TokenListResponse[];
  onTokenSelected: (token: Token) => void;
}

const TokenTable = ({ tokens, onTokenSelected }: TokenTableProps) => {
  const { address } = useAccount();
  const fetchTokenAddress = api.coingecko.getTokenByIdQuery.useMutation();

  const selectToken = async (tokenListResponse: TokenListResponse) => {
    const tokenData = await fetchTokenAddress.mutateAsync({
      id: tokenListResponse.id,
    });

    const baseToken = tokenData.detail_platforms.base;
    if (!baseToken) return;

    onTokenSelected({
      address: baseToken.contract_address as `0x${string}`,
      chainId: 8453,
      decimals: baseToken.decimal_place,
      name: tokenListResponse.name,
      symbol: tokenListResponse.symbol,
      image: tokenListResponse.image,
    });
  };

  const handleTokenSelection = async (token: TokenListResponse) => {
    if (address) {
      try {
        await selectToken(token);
      } catch (error) {
        console.error("Error selecting token:", error);
      }
    } else {
      alert("Please connect your wallet to swap");
    }
  };

  const columns: ColumnsType<TokenListResponse> = [
    {
      title: "#",
      dataIndex: "market_cap_rank",
      key: "rank",
      sorter: (a, b) => (a.market_cap_rank ?? 0) - (b.market_cap_rank ?? 0),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: TokenListResponse) => (
        <div className="flex items-center gap-2">
          <Image src={record.image} alt={text} width={24} height={24} />
          <span>{text}</span>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Price",
      dataIndex: "current_price",
      key: "price",
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a, b) => a.current_price - b.current_price,
    },
    {
      title: "24h %",
      dataIndex: "price_change_percentage_24h",
      key: "price_change",
      render: (change: number | null) => (
        <span style={{ color: change && change >= 0 ? "green" : "red", display:"flex", alignItems:"center" }}>
          {change && change >= 0 ? <FaSortUp /> : <FaSortDown />}
          {change?.toFixed(2)}%
        </span>
      ),
      sorter: (a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0),
    },
    {
      title: "Market Cap",
      dataIndex: "market_cap",
      key: "market_cap",
      render: (cap: number | null) => `$${cap?.toLocaleString()}`,
      sorter: (a, b) => (a.market_cap ?? 0) - (b.market_cap ?? 0),
    },
    {
      title: "Volume",
      dataIndex: "total_volume",
      key: "volume",
      render: (volume: number | null) => `$${volume?.toLocaleString()}`,
      sorter: (a, b) => (a.total_volume ?? 0) - (b.total_volume ?? 0),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tokens}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      onRow={(record) => ({
        onClick: () => void handleTokenSelection(record),
      })}
    />
  );
};

export default TokenTable;
