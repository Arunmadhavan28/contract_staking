import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakingContract } from "../target/types/staking_contract";
import { Keypair, SystemProgram, PublicKey } from "@solana/web3.js";
import { assert } from "chai";

describe("staking_contract", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.StakingContract as Program<StakingContract>;
  const user = Keypair.generate();
  let stakeAccount: PublicKey;

  it("Is initialized!", async () => {
    // Derive the address of the stake_account PDA
    const [stakeAccountPda, _bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake"), user.publicKey.toBuffer()],
      program.programId
    );
    stakeAccount = stakeAccountPda;

    const tx = await program.methods
      .initialize()
      .accounts({
        stakeAccount,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    console.log("Your transaction signature", tx);

    // Fetch the created stake account
    const account = await program.account.stakeAccount.fetch(stakeAccount);

    // Assert that the owner and amount are initialized correctly
    assert.ok(account.owner.equals(user.publicKey));
    assert.ok(account.amount.eq(new anchor.BN(0)));
  });
});