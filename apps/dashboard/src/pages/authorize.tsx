import { createAsync, query, useNavigate, useSearchParams } from "@solidjs/router";
import { createEffect, on, Show } from "solid-js";
import { Address } from "../constants/address";
import { authVersion, bumpAuth } from "../auth";

const getLoginDataQuery = query(async (code: string | string[] | undefined) => {

    if (!(typeof code == 'string')) return {};

    const client_id = '1388081907127812306';
    const sapphire_uri = `${Address.LOCALHOSTNUMBACK}/oauth/callback`;
    const redirect_uri = 'http://localhost:3000/oauth/authorize';

    // Call the backend to exchange the code for an access token.
    const response = await fetch(sapphire_uri, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          code,
          client_id,
          redirect_uri,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json()

      return data;
  }, "userData");

  export default function Authorize() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
  
    const loginData = createAsync(async () => {
      const data = await getLoginDataQuery(searchParams.code);
      bumpAuth(v => v + 1);
      navigate("/", { replace: true });
      return data;
    });
  
    return (
      <Show when={!loginData()}>
        <p>Logging you in…</p>
      </Show>
    );
  }
  