<script>
  import { base } from "$app/paths";
  import supabase from "$lib/supabase";

  function googleSignin() {
    console.log(location.origin + base);
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: location.origin + base,
      },
    });
  }
</script>

<div
  class="w-screen h-screen flex items-center justify-center p-5"
  style="background-image: url(https://images.unsplash.com/photo-1505533321630-975218a5f66f);"
>
  <div class="card bg-base-100 w-96 shadow-sm relative">
    <figure>
      <img
        src="https://images.unsplash.com/photo-1509062522246-3755977927d7"
        alt="Shoes"
      />
    </figure>
    <div class="card-body">
      <h2 class="card-title">Sign In</h2>
      <p>Selamat Datang di Sistem Absensi Terpadu</p>
      <div class="card-actions mt-6">
        <button onclick={googleSignin} class="btn btn-primary w-full"
          >Sign In With Google</button
        >
      </div>
    </div>
    <div class="absolute top-full">
      <small class="mt-5 block text-center">
        akun anda akan otomatis terdaftar pada saat pertama kali login
      </small>
    </div>
  </div>
</div>
