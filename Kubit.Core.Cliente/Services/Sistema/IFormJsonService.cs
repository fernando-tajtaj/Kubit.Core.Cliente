namespace Kubit.Core.Cliente.Services.Sistema
{
    public interface IFormJsonService
    {
        Task<Modelo.Templates.Modelo?> GetTemplateAsync(string pProgramaTablaPrimaria, string pUuidEmpresa, string pAccion);
    }
}
