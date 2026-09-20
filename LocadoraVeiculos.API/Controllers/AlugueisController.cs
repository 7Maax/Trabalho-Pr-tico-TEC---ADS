using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LocadoraVeiculos.API.Data;
using LocadoraVeiculos.API.DTOs;
using LocadoraVeiculos.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlugueisController : ControllerBase
    {
        private readonly LocadoraContext _context;

        public AlugueisController(LocadoraContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AluguelResponseDto>>> GetAll()
        {
            var alugueis = await _context.Alugueis
                .Include(a => a.Cliente)
                .Include(a => a.Veiculo)
                .Select(a => MapToDto(a))
                .ToListAsync();

            return Ok(alugueis);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AluguelResponseDto>> GetById(int id)
        {
            var aluguel = await _context.Alugueis
                .Include(a => a.Cliente)
                .Include(a => a.Veiculo)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aluguel == null)
                return NotFound(new { mensagem = $"Aluguel com ID {id} não encontrado." });

            return Ok(MapToDto(aluguel));
        }

        [HttpGet("cliente/{clienteId}")]
        public async Task<ActionResult<IEnumerable<AluguelResponseDto>>> GetByCliente(int clienteId)
        {
            if (!await _context.Clientes.AnyAsync(c => c.Id == clienteId))
                return NotFound(new { mensagem = $"Cliente com ID {clienteId} não encontrado." });

            var alugueis = await _context.Alugueis
                .Include(a => a.Cliente)
                .Include(a => a.Veiculo)
                .Where(a => a.ClienteId == clienteId)
                .Select(a => MapToDto(a))
                .ToListAsync();

            return Ok(alugueis);
        }

        [HttpPost]
        public async Task<ActionResult<AluguelResponseDto>> Create([FromBody] AluguelRequestDto dto)
        {
            var cliente = await _context.Clientes.FindAsync(dto.ClienteId);
            if (cliente == null)
                return BadRequest(new { mensagem = $"Cliente com ID {dto.ClienteId} não encontrado." });

            var veiculo = await _context.Veiculos
                .Include(v => v.Categoria)
                .FirstOrDefaultAsync(v => v.Id == dto.VeiculoId);

            if (veiculo == null)
                return BadRequest(new { mensagem = $"Veículo com ID {dto.VeiculoId} não encontrado." });

            if (!veiculo.Disponivel)
                return BadRequest(new { mensagem = $"O veículo '{veiculo.Modelo}' (placa {veiculo.Placa}) não está disponível para aluguel." });

            if (dto.DataFimPrevista <= dto.DataInicio)
                return BadRequest(new { mensagem = "A data de fim prevista deve ser posterior à data de início." });

            var aluguel = new Aluguel
            {
                ClienteId = dto.ClienteId,
                VeiculoId = dto.VeiculoId,
                DataInicio = dto.DataInicio,
                DataFimPrevista = dto.DataFimPrevista,
                QuilometragemInicial = veiculo.Quilometragem,
                ValorDiaria = veiculo.Categoria.ValorDiaria,
                Status = "Ativo"
            };

            veiculo.Disponivel = false;

            _context.Alugueis.Add(aluguel);
            await _context.SaveChangesAsync();

            await _context.Entry(aluguel).Reference(a => a.Cliente).LoadAsync();
            await _context.Entry(aluguel).Reference(a => a.Veiculo).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = aluguel.Id }, MapToDto(aluguel));
        }

        [HttpPut("{id}/devolver")]
        public async Task<ActionResult<AluguelResponseDto>> Devolver(int id, [FromBody] DevolucaoRequestDto dto)
        {
            var aluguel = await _context.Alugueis
                .Include(a => a.Cliente)
                .Include(a => a.Veiculo)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aluguel == null)
                return NotFound(new { mensagem = $"Aluguel com ID {id} não encontrado." });

            if (aluguel.Status != "Ativo")
                return BadRequest(new { mensagem = $"Não é possível registrar devolução de um aluguel com status '{aluguel.Status}'." });

            if (dto.QuilometragemFinal < aluguel.QuilometragemInicial)
                return BadRequest(new { mensagem = "A quilometragem final não pode ser menor que a quilometragem inicial." });

            if (dto.DataDevolucao < aluguel.DataInicio)
                return BadRequest(new { mensagem = "A data de devolução não pode ser anterior à data de início do aluguel." });

            int diasAluguel = Math.Max(1, (int)Math.Ceiling((dto.DataDevolucao - aluguel.DataInicio).TotalDays));

            aluguel.DataDevolucao = dto.DataDevolucao;
            aluguel.QuilometragemFinal = dto.QuilometragemFinal;
            aluguel.ValorTotal = diasAluguel * aluguel.ValorDiaria;
            aluguel.Status = "Concluido";

            aluguel.Veiculo.Quilometragem = dto.QuilometragemFinal;
            aluguel.Veiculo.Disponivel = true;

            await _context.SaveChangesAsync();
            return Ok(MapToDto(aluguel));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancelar(int id)
        {
            var aluguel = await _context.Alugueis
                .Include(a => a.Veiculo)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aluguel == null)
                return NotFound(new { mensagem = $"Aluguel com ID {id} não encontrado." });

            if (aluguel.Status != "Ativo")
                return BadRequest(new { mensagem = $"Apenas aluguéis com status 'Ativo' podem ser cancelados. Status atual: '{aluguel.Status}'." });

            aluguel.Status = "Cancelado";
            aluguel.Veiculo.Disponivel = true;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static AluguelResponseDto MapToDto(Aluguel a) => new AluguelResponseDto
        {
            Id = a.Id,
            Cliente = a.Cliente.Nome,
            Veiculo = $"{a.Veiculo.Modelo} ({a.Veiculo.AnoFabricacao})",
            Placa = a.Veiculo.Placa,
            DataInicio = a.DataInicio,
            DataFimPrevista = a.DataFimPrevista,
            DataDevolucao = a.DataDevolucao,
            QuilometragemInicial = a.QuilometragemInicial,
            QuilometragemFinal = a.QuilometragemFinal,
            ValorDiaria = a.ValorDiaria,
            ValorTotal = a.ValorTotal,
            Status = a.Status
        };
    }
}
