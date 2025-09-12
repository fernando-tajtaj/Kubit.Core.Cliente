using Kubit.Core.Modelo.Schemas.Seguridad;

namespace Kubit.Core.Cliente.Services.Seguridad
{
    public class PermisoService :IPermisoService
    {
        private readonly HttpClient _httpClient;

        public PermisoService(HttpClient httpClient)
        {
            this._httpClient = httpClient;
        }

        public async Task<List<Fn_Menu_Permisos>> GetMenuPermisosByUserAsync(string pUsuarioUuid)
        {
            var response = await _httpClient.GetAsync($"/api/permiso/{Uri.EscapeDataString(pUsuarioUuid)}");

            if (!response.IsSuccessStatusCode)
                return new List<Fn_Menu_Permisos>();

            var result = await response.Content.ReadFromJsonAsync<List<Fn_Menu_Permisos>>();

            return result ?? new List<Fn_Menu_Permisos>();
        }
    }
}
