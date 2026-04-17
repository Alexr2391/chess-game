import { SceneLoader } from "./(ui)/components/SceneLoader/SceneLoader";
import css from "./page.module.scss";

export default function Home() {
  return (
    <div className={css.container}>
      <SceneLoader />
    </div>
  );
}
