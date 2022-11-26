import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

export default function Protected(props: any) {
  const router = useRouter();
  return (
    <div>
      <main className={styles.main}>
        {props?.isAuthorized ? (
          <>
            <h1>Protected Page</h1>
            <h2>Voila 🎉🎉🥳🎉🎉</h2>
            <p>
              You are authorized to view this page. Since you possess the{" "}
              <a href="https://mumbai.polygonscan.com/token/0x3ce643dc61bb40bb0557316539f4a93016051b81">
                Valist Product License
              </a>
            </p>
          </>
        ) : (
          <>
            <h1>Protected Page</h1>
            <p>
              You are not authorized to view this page. Since you do not possess
              required{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://mumbai.polygonscan.com/token/0x3ce643dc61bb40bb0557316539f4a93016051b81"
              >
                Valist Product License
              </a>
              . Go and mint one from{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="http://color-marketplace.vercel.app/"
              >
                here
              </a>
            </p>
          </>
        )}
        {/* logout */}
        <button
          className={styles.button}
          onClick={() => {
            router.push("/");
          }}
        >
          Logout
        </button>
      </main>
    </div>
  );
}

export const getServerSideProps = async () => {
  return {
    props: {
      isAuthorized: true
    }
  };
};