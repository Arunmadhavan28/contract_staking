import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useState, useEffect, useCallback } from "react";
import * as anchor from "@project-serum/anchor";

//   import for IDL JSON
import idl from "/Users/arunmadhavanevr/Downloads/contract_staking/target/idl/staking_contract.json";

//  Constants
const PROGRAM_ID = new PublicKey("DXZufsxHiAXspCwRwNXs9mrjDcSeF1ZH2CpKYLNkWbJk");
const STAKE_ACCOUNT_SEED = "staking_account";

export default function StakePanel() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  
  const [provider, setProvider] = useState<anchor.AnchorProvider | null>(null);
  const [program, setProgram] = useState<anchor.Program<any> | null>(null);
  const [stakeAccount, setStakeAccount] = useState<PublicKey | null>(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");

  //  Setup Provider and Program
  useEffect(() => {
    if (!publicKey || !connection) return;

    const wallet = {
      publicKey,
      signTransaction,
      signAllTransactions: async (txs: any) => txs.map((tx: any) => signTransaction(tx)),
    } as any;

    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "processed",
    });

    const program = new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);

    setProvider(provider);
    setProgram(program);
  }, [connection, publicKey, signTransaction]);

  //  Calculate stakeAccount PDA once program & provider are ready
  useEffect(() => {
    if (!program || !provider || !publicKey) return;

    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(STAKE_ACCOUNT_SEED),
        publicKey.toBuffer(),
      ],
      program.programId
    );

    console.log('Staking Account PDA:', pda.toBase58());
    setStakeAccount(pda);
  }, [program, provider, publicKey]);

  //  Initialize stake account
  const initialize = useCallback(async () => {
    if (!program || !stakeAccount || !provider) return;

    try {
      await program.methods
        .initialize()
        .accounts({
          stakeAccount: stakeAccount,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setMessage("✅ Stake account initialized");
    } catch (e: any) {
      console.error(e);
      setMessage("❌ Failed to initialize: " + e.message);
    }
  }, [program, stakeAccount, provider]);

  //  Stake function
  const stake = useCallback(async () => {
    if (!program || !stakeAccount || !publicKey) return;

    try {
      await program.methods
        .stake(new anchor.BN(amount))
        .accounts({
          stakeAccount: stakeAccount,
          owner: publicKey,
        })
        .rpc();

      setMessage(`✅ Staked ${amount}`);
    } catch (e: any) {
      console.error(e);
      setMessage("❌ Stake failed: " + e.message);
    }
  }, [program, stakeAccount, publicKey, amount]);

  //  Unstake function
  const unstake = useCallback(async () => {
    if (!program || !stakeAccount || !publicKey) return;

    try {
      await program.methods
        .unstake(new anchor.BN(amount))
        .accounts({
          stakeAccount: stakeAccount,
          owner: publicKey,
        })
        .rpc();

      setMessage(`✅ Unstaked ${amount}`);
    } catch (e: any) {
      console.error(e);
      setMessage("❌ Unstake failed: " + e.message);
    }
  }, [program, stakeAccount, publicKey, amount]);

  return (
    <div className="p-4 bg-white shadow-md rounded-md w-full max-w-md text-center">
      <h2 className="text-lg font-semibold mb-2">Stake Panel</h2>
      <div className="flex flex-col gap-2">
        <input
          type="number"
          className="p-2 border rounded"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Amount to stake/unstake"
        />
        <button onClick={initialize} className="bg-blue-500 text-white px-4 py-2 rounded">
          Initialize Stake Account
        </button>
        <button onClick={stake} className="bg-green-500 text-white px-4 py-2 rounded">
          Stake
        </button>
        <button onClick={unstake} className="bg-red-500 text-white px-4 py-2 rounded">
          Unstake
        </button>
        {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
